# Design: admin-user-management

## 1. Overview

어드민 대시보드에 유저 관리 기능을 추가한다. 백엔드에 어드민용 유저 목록/검색/정지 API를 신규 생성하고, admin-spotLine에 유저 관리 페이지를 구현한다.

**Target Repos**:
- `springboot-spotLine-backend` — 백엔드 API (5 files)
- `admin-spotLine` — 어드민 프론트 (5 files)

---

## 2. Implementation Order

| # | Repo | File | Change | LOC |
|---|------|------|--------|-----|
| 1 | backend | `domain/entity/User.java` | suspended, suspendedAt 필드 추가 | ~5 |
| 2 | backend | `domain/repository/UserRepository.java` | 검색/필터 쿼리 메서드 추가 | ~15 |
| 3 | backend | `dto/response/UserAdminResponse.java` | 어드민용 유저 응답 DTO (새 파일) | ~50 |
| 4 | backend | `service/AdminUserService.java` | 유저 목록/정지 비즈니스 로직 (새 파일) | ~70 |
| 5 | backend | `controller/AdminUserController.java` | REST API 컨트롤러 (새 파일) | ~55 |
| 6 | admin | `src/types/v2.ts` | UserAdminItem 타입 추가 | ~15 |
| 7 | admin | `src/services/v2/userAPI.ts` | API 서비스 (새 파일) | ~25 |
| 8 | admin | `src/pages/UserManagement.tsx` | 유저 관리 페이지 (새 파일) | ~180 |
| 9 | admin | `src/components/Layout.tsx` | 유저 관리 네비게이션 추가 | ~3 |
| 10 | admin | `src/App.tsx` | /users 라우트 추가 | ~5 |

---

## 3. Detailed Changes

### 3.1 Backend — `User.java` 수정

기존 User 엔티티에 2개 필드 추가:

```java
// updatedAt 필드 아래에 추가
@Builder.Default
private Boolean suspended = false;

private LocalDateTime suspendedAt;
```

JPA auto-ddl이 nullable 컬럼으로 추가하므로 별도 마이그레이션 불필요.

### 3.2 Backend — `UserRepository.java` 수정

```java
package com.spotline.api.domain.repository;

import com.spotline.api.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    // 전체 유저 (키워드 검색)
    @Query("SELECT u FROM User u WHERE " +
           "(:keyword IS NULL OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findAllWithKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 활성 유저 (키워드 검색)
    @Query("SELECT u FROM User u WHERE u.suspended = false AND " +
           "(:keyword IS NULL OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findActiveWithKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 정지 유저 (키워드 검색)
    @Query("SELECT u FROM User u WHERE u.suspended = true AND " +
           "(:keyword IS NULL OR LOWER(u.nickname) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findSuspendedWithKeyword(@Param("keyword") String keyword, Pageable pageable);
}
```

### 3.3 Backend — `UserAdminResponse.java` (새 파일)

`src/main/java/com/spotline/api/dto/response/UserAdminResponse.java`

```java
package com.spotline.api.dto.response;

import com.spotline.api.domain.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "어드민 유저 목록 응답")
@Data
@Builder
public class UserAdminResponse {

    private String id;
    private String email;
    private String nickname;
    private String avatar;
    private String bio;
    private String role;
    private Boolean suspended;
    private Integer followersCount;
    private Integer followingCount;
    private long spotsCount;
    private long spotLinesCount;
    private long blogsCount;
    private LocalDateTime createdAt;
    private LocalDateTime suspendedAt;

    public static UserAdminResponse from(User user, long spotsCount, long spotLinesCount, long blogsCount) {
        return UserAdminResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatar(user.getAvatar())
                .bio(user.getBio())
                .role(user.getRole())
                .suspended(user.getSuspended() != null && user.getSuspended())
                .followersCount(user.getFollowersCount())
                .followingCount(user.getFollowingCount())
                .spotsCount(spotsCount)
                .spotLinesCount(spotLinesCount)
                .blogsCount(blogsCount)
                .createdAt(user.getCreatedAt())
                .suspendedAt(user.getSuspendedAt())
                .build();
    }
}
```

### 3.4 Backend — `AdminUserService.java` (새 파일)

`src/main/java/com/spotline/api/service/AdminUserService.java`

```java
package com.spotline.api.service;

import com.spotline.api.domain.entity.User;
import com.spotline.api.domain.repository.BlogRepository;
import com.spotline.api.domain.repository.SpotLineRepository;
import com.spotline.api.domain.repository.SpotRepository;
import com.spotline.api.domain.repository.UserRepository;
import com.spotline.api.dto.response.UserAdminResponse;
import com.spotline.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;
    private final SpotRepository spotRepository;
    private final SpotLineRepository spotLineRepository;
    private final BlogRepository blogRepository;

    public Page<UserAdminResponse> list(String status, String keyword, Pageable pageable) {
        String kw = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;

        Page<User> users;
        if ("SUSPENDED".equals(status)) {
            users = userRepository.findSuspendedWithKeyword(kw, pageable);
        } else if ("ACTIVE".equals(status)) {
            users = userRepository.findActiveWithKeyword(kw, pageable);
        } else {
            users = userRepository.findAllWithKeyword(kw, pageable);
        }

        return users.map(user -> {
            long spots = spotRepository.countByCreatorId(user.getId());
            long spotLines = spotLineRepository.countByCreatorId(user.getId());
            long blogs = blogRepository.countByUserId(user.getId());
            return UserAdminResponse.from(user, spots, spotLines, blogs);
        });
    }

    @Transactional
    public UserAdminResponse suspend(String userId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (Boolean.TRUE.equals(user.getSuspended())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이미 정지된 유저입니다");
        }
        user.setSuspended(true);
        user.setSuspendedAt(LocalDateTime.now());
        userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public UserAdminResponse unsuspend(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        if (!Boolean.TRUE.equals(user.getSuspended())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "정지 상태가 아닌 유저입니다");
        }
        user.setSuspended(false);
        user.setSuspendedAt(null);
        userRepository.save(user);
        return toResponse(user);
    }

    private UserAdminResponse toResponse(User user) {
        long spots = spotRepository.countByCreatorId(user.getId());
        long spotLines = spotLineRepository.countByCreatorId(user.getId());
        long blogs = blogRepository.countByUserId(user.getId());
        return UserAdminResponse.from(user, spots, spotLines, blogs);
    }
}
```

**필요한 Repository 메서드** (없으면 추가):
- `SpotRepository`: `long countByCreatorId(String creatorId);`
- `SpotLineRepository`: `long countByCreatorId(String creatorId);`
- `BlogRepository`: `long countByUserId(String userId);` (이미 `countBySpotLineIdAndIsActiveTrue` 존재, userId 버전 추가 필요 확인)

### 3.5 Backend — `AdminUserController.java` (새 파일)

`src/main/java/com/spotline/api/controller/AdminUserController.java`

```java
package com.spotline.api.controller;

import com.spotline.api.dto.response.UserAdminResponse;
import com.spotline.api.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin - User", description = "관리자 유저 관리")
@RestController
@RequestMapping("/api/v2/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "유저 목록 (관리자)")
    @GetMapping
    public Page<UserAdminResponse> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 20) Pageable pageable) {
        return adminUserService.list(status, keyword, pageable);
    }

    @Operation(summary = "유저 정지")
    @PatchMapping("/{userId}/suspend")
    public UserAdminResponse suspend(
            @PathVariable String userId,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.getOrDefault("reason", "") : "";
        return adminUserService.suspend(userId, reason);
    }

    @Operation(summary = "유저 정지 해제")
    @PatchMapping("/{userId}/unsuspend")
    public UserAdminResponse unsuspend(@PathVariable String userId) {
        return adminUserService.unsuspend(userId);
    }
}
```

---

### 3.6 Admin — `types/v2.ts` 추가

Blog 타입 아래, SpringPage 위에 추가:

```typescript
// ── User (Admin) ──

export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface UserAdminItem {
  id: string;
  email: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  role: string;
  suspended: boolean;
  followersCount: number;
  followingCount: number;
  spotsCount: number;
  spotLinesCount: number;
  blogsCount: number;
  createdAt: string;
  suspendedAt: string | null;
}
```

### 3.7 Admin — `services/v2/userAPI.ts` (새 파일)

```typescript
import { apiClient } from "../base/apiClient";
import type { UserAdminItem, SpringPage } from "../../types/v2";

export interface UserListParams {
  page?: number; // 1-indexed (UI 기준)
  size?: number;
  status?: string;
  keyword?: string;
}

export const userAPI = {
  getList: (params: UserListParams = {}) => {
    const { page = 1, size = 20, ...rest } = params;
    return apiClient.get<SpringPage<UserAdminItem>>("/api/v2/admin/users", {
      params: { page: page - 1, size, ...rest }, // 1-indexed → 0-indexed
    });
  },

  suspend: (userId: string, reason: string) =>
    apiClient.patch<UserAdminItem>(`/api/v2/admin/users/${userId}/suspend`, { reason }),

  unsuspend: (userId: string) =>
    apiClient.patch<UserAdminItem>(`/api/v2/admin/users/${userId}/unsuspend`),
};
```

### 3.8 Admin — `pages/UserManagement.tsx` (새 파일)

BlogManagement.tsx 패턴을 따르되, 유저 상세 모달을 인라인으로 포함:

```typescript
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import DataTable from "../components/DataTable";
import { userAPI } from "../services/v2/userAPI";
import type { UserAdminItem } from "../types/v2";
import { toDataTablePagination } from "../types/v2";
import { Eye, Ban, CheckCircle, X } from "lucide-react";

export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserAdminItem | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const queryClient = useQueryClient();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setKeyword(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, statusFilter, keyword],
    queryFn: () => userAPI.getList({
      page,
      size: 20,
      status: statusFilter || undefined,
      keyword: keyword || undefined,
    }),
    placeholderData: keepPreviousData,
  });

  const springPage = data?.data;
  const users = springPage?.content ?? [];
  const pagination = springPage ? toDataTablePagination(springPage) : null;

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      userAPI.suspend(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
      setSuspendReason("");
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) => userAPI.unsuspend(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
    },
  });

  const columns = [
    {
      key: "nickname",
      label: "닉네임",
      render: (_val: string, row: UserAdminItem) => (
        <div className="flex items-center gap-2">
          {row.avatar ? (
            <img src={row.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <div className="h-7 w-7 rounded-full bg-gray-200" />
          )}
          <span className="font-medium">{row.nickname}</span>
        </div>
      ),
    },
    { key: "email", label: "이메일" },
    { key: "role", label: "역할" },
    {
      key: "suspended",
      label: "상태",
      render: (val: boolean) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          val ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
        }`}>
          {val ? "정지" : "활성"}
        </span>
      ),
    },
    {
      key: "followersCount",
      label: "팔로워",
      render: (val: number) => val.toLocaleString(),
    },
    {
      key: "createdAt",
      label: "가입일",
      render: (val: string) => new Date(val).toLocaleDateString("ko-KR"),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">유저 관리</h1>
        <p className="text-sm text-gray-500 mt-1">플랫폼 유저를 관리합니다</p>
      </div>

      {/* 상태 탭 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "", label: "전체" },
          { key: "ACTIVE", label: "활성" },
          { key: "SUSPENDED", label: "정지" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setStatusFilter(tab.key); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-md ${
              statusFilter === tab.key
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 검색 */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="닉네임 또는 이메일 검색..."
          className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        />
        {pagination && (
          <span className="text-sm text-gray-500 self-center">총 {pagination.count}명</span>
        )}
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        actions={(row: UserAdminItem) => (
          <div className="py-1">
            <button
              onClick={() => setSelectedUser(row)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" /> 상세보기
            </button>
            {row.suspended ? (
              <button
                onClick={() => {
                  if (window.confirm(`"${row.nickname}" 유저의 정지를 해제하시겠습니까?`)) {
                    unsuspendMutation.mutate(row.id);
                  }
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> 정지 해제
              </button>
            ) : (
              <button
                onClick={() => { setSelectedUser(row); setSuspendReason(""); }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Ban className="h-4 w-4 mr-2" /> 정지
              </button>
            )}
          </div>
        )}
      />

      {/* 유저 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">유저 상세</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 프로필 */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt="" className="h-14 w-14 rounded-full object-cover" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-200" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">{selectedUser.nickname}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      selectedUser.suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {selectedUser.suspended ? "정지" : "활성"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  {selectedUser.bio && <p className="text-sm text-gray-600 mt-1">{selectedUser.bio}</p>}
                </div>
              </div>

              {/* 활동 통계 */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Spot", value: selectedUser.spotsCount },
                  { label: "SpotLine", value: selectedUser.spotLinesCount },
                  { label: "Blog", value: selectedUser.blogsCount },
                  { label: "팔로워", value: selectedUser.followersCount },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* 메타 정보 */}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>가입일: {new Date(selectedUser.createdAt).toLocaleDateString("ko-KR")}</p>
                <p>역할: {selectedUser.role}</p>
                {selectedUser.suspendedAt && (
                  <p className="text-red-500">정지일: {new Date(selectedUser.suspendedAt).toLocaleDateString("ko-KR")}</p>
                )}
              </div>

              {/* 정지/해제 액션 */}
              {selectedUser.suspended ? (
                <button
                  onClick={() => {
                    if (window.confirm(`"${selectedUser.nickname}" 유저의 정지를 해제하시겠습니까?`)) {
                      unsuspendMutation.mutate(selectedUser.id);
                    }
                  }}
                  disabled={unsuspendMutation.isPending}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {unsuspendMutation.isPending ? "처리 중..." : "정지 해제"}
                </button>
              ) : (
                <div>
                  <textarea
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="정지 사유를 입력하세요..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => suspendMutation.mutate({ userId: selectedUser.id, reason: suspendReason })}
                    disabled={suspendMutation.isPending}
                    className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {suspendMutation.isPending ? "처리 중..." : "유저 정지"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 3.9 Admin — `Layout.tsx` 수정

navigation 배열의 시스템 섹션에 유저 관리 추가 (모더레이션 앞):

```typescript
// 시스템 섹션 — 모더레이션 위에 추가
{ name: "유저 관리", href: "/users", icon: Users, section: "system", minRole: "admin" },
```

`Users` 아이콘은 이미 import되어 있음 (어드민 관리에서 사용).

### 3.10 Admin — `App.tsx` 수정

BlogManagement import 아래에 추가:

```typescript
import UserManagement from "./pages/UserManagement";
```

Route — moderation 앞에 추가:

```tsx
<Route path="users" element={
  <ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>
} />
```

---

## 4. Backend Repository 추가 메서드

SpotRepository, SpotLineRepository, BlogRepository에 countBy 메서드가 없으면 추가:

```java
// SpotRepository — 추가 필요 시
long countByCreatorId(String creatorId);

// SpotLineRepository — 추가 필요 시
long countByCreatorId(String creatorId);

// BlogRepository — 추가 필요 시
long countByUserId(String userId);
```

---

## 5. Verification Checklist

- [ ] User.java에 suspended, suspendedAt 필드 존재
- [ ] UserRepository에 검색/필터 쿼리 3개 존재
- [ ] UserAdminResponse DTO 생성
- [ ] AdminUserService 생성 (list, suspend, unsuspend)
- [ ] AdminUserController 생성 (GET /api/v2/admin/users, PATCH suspend/unsuspend)
- [ ] SpotRepository, SpotLineRepository, BlogRepository에 countBy 메서드 존재
- [ ] admin types/v2.ts에 UserAdminItem, UserStatus 타입
- [ ] admin services/v2/userAPI.ts 생성
- [ ] admin pages/UserManagement.tsx 생성 (목록 + 검색 + 탭 + 모달)
- [ ] Layout.tsx에 유저 관리 네비게이션 추가
- [ ] App.tsx에 /users 라우트 추가
- [ ] 상태 탭 (전체/활성/정지) 동작
- [ ] 닉네임/이메일 검색 동작 (300ms 디바운스)
- [ ] 유저 상세 모달 (프로필 + 통계 + 정지/해제)
- [ ] 백엔드 빌드 통과 (./gradlew build)
- [ ] admin-spotLine 빌드 통과 (pnpm build)
