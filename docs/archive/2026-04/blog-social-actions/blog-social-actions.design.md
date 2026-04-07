# Blog Social Actions Design Document

> **Feature**: Blog Social Actions
> **Plan Reference**: `docs/01-plan/features/blog-social-actions.plan.md`
> **Version**: 1.0.0
> **Date**: 2026-04-07
> **Status**: Design

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | Blog에 좋아요/저장 기능이 없고, commentsCount가 하드코딩(0)되어 콘텐츠 engagement를 측정하거나 유도할 수 없다. |
| **Solution** | Backend에 BlogLike/BlogSave 엔티티 + SocialController blog 엔드포인트 3개 추가, Blog에 commentsCount 필드 추가. Frontend useSocialStore/api.ts를 "blog" 타입으로 확장, blog 상세 페이지에 SocialHydrator + 좋아요/저장 버튼 추가. |
| **Function/UX Effect** | Blog 상세 페이지에서 좋아요/저장 토글이 가능하고, 실제 댓글 수가 표시된다. |
| **Core Value** | 콘텐츠 engagement loop 완성 — 블로그가 단순 읽기에서 소셜 인터랙션으로 확장. |

---

## 1. Architecture Overview

### 1.1 Data Flow

```
Blog Detail Page (SSR)
  → SocialHydrator (client) → GET /blogs/{id}/social → useSocialStore 초기화
  → Like/Save 버튼 클릭 → useSocialStore.toggleLike/Save → POST /blogs/{id}/like|save
  → 낙관적 업데이트 (즉시 UI 반영) → API 응답으로 실제 카운트 동기화
```

### 1.2 Implementation Order

| Step | Task | Repo | Files |
|------|------|------|-------|
| 1 | BlogLike + BlogSave 엔티티/Repository | backend | 4 new files |
| 2 | SocialService blog 메서드 3개 | backend | SocialService.java (modify) |
| 3 | SocialController blog 엔드포인트 3개 | backend | SocialController.java (modify) |
| 4 | Blog.commentsCount + CommentService 연동 | backend | Blog.java, CommentService.java (modify) |
| 5 | BlogDetailResponse/BlogResponse에 commentsCount | backend | 2 files (modify) |
| 6 | api.ts + useSocialStore "blog" 타입 확장 | front | 2 files (modify) |
| 7 | types/index.ts commentsCount 추가 | front | 1 file (modify) |
| 8 | blog/[slug]/page.tsx SocialHydrator + 버튼 + commentsCount | front | 1 file (modify) |

---

## 2. Backend Design (springboot-spotLine-backend)

### 2.1 New Entity: BlogLike

**File**: `src/main/java/com/spotline/api/domain/entity/BlogLike.java` (NEW)

Pattern: SpotLike.java와 동일 구조

```java
@Entity
@Table(name = "blog_likes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "blog_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogLike {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2.2 New Entity: BlogSave

**File**: `src/main/java/com/spotline/api/domain/entity/BlogSave.java` (NEW)

Pattern: SpotSave.java와 동일 구조

```java
@Entity
@Table(name = "blog_saves", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "blog_id"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BlogLike {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    private Blog blog;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

### 2.3 New Repository: BlogLikeRepository

**File**: `src/main/java/com/spotline/api/domain/repository/BlogLikeRepository.java` (NEW)

```java
public interface BlogLikeRepository extends JpaRepository<BlogLike, UUID> {
    Optional<BlogLike> findByUserIdAndBlog(String userId, Blog blog);
    boolean existsByUserIdAndBlog(String userId, Blog blog);
    Page<BlogLike> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
```

### 2.4 New Repository: BlogSaveRepository

**File**: `src/main/java/com/spotline/api/domain/repository/BlogSaveRepository.java` (NEW)

```java
public interface BlogSaveRepository extends JpaRepository<BlogSave, UUID> {
    Optional<BlogSave> findByUserIdAndBlog(String userId, Blog blog);
    boolean existsByUserIdAndBlog(String userId, Blog blog);
    Page<BlogSave> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
```

### 2.5 SocialService — Blog 메서드 추가

**File**: `SocialService.java` (MODIFY — 3개 메서드 추가)

주입 추가:
```java
private final BlogRepository blogRepository;
private final BlogLikeRepository blogLikeRepository;
private final BlogSaveRepository blogSaveRepository;
```

#### toggleBlogLike(UUID blogId, String userId)

```java
@Transactional
public SocialToggleResponse toggleBlogLike(UUID blogId, String userId) {
    Blog blog = blogRepository.findById(blogId)
            .orElseThrow(() -> new ResourceNotFoundException("Blog", blogId.toString()));

    Optional<BlogLike> existing = blogLikeRepository.findByUserIdAndBlog(userId, blog);
    boolean liked;
    if (existing.isPresent()) {
        blogLikeRepository.delete(existing.get());
        blog.setLikesCount(Math.max(0, blog.getLikesCount() - 1));
        liked = false;
    } else {
        blogLikeRepository.save(BlogLike.builder().userId(userId).blog(blog).build());
        blog.setLikesCount(blog.getLikesCount() + 1);
        liked = true;
    }
    blogRepository.save(blog);

    return SocialToggleResponse.builder()
            .liked(liked).likesCount(blog.getLikesCount())
            .savesCount(blog.getSavesCount()).build();
}
```

#### toggleBlogSave(UUID blogId, String userId)

동일 패턴 — BlogSave 엔티티 사용, `saved` 필드 반환.

#### getBlogSocialStatus(UUID blogId, String userId)

```java
@Transactional(readOnly = true)
public SocialStatusResponse getBlogSocialStatus(UUID blogId, String userId) {
    Blog blog = blogRepository.findById(blogId)
            .orElseThrow(() -> new ResourceNotFoundException("Blog", blogId.toString()));

    boolean isLiked = userId != null && blogLikeRepository.existsByUserIdAndBlog(userId, blog);
    boolean isSaved = userId != null && blogSaveRepository.existsByUserIdAndBlog(userId, blog);

    return SocialStatusResponse.builder()
            .isLiked(isLiked).isSaved(isSaved).build();
}
```

### 2.6 SocialController — Blog 엔드포인트 추가

**File**: `SocialController.java` (MODIFY — 3개 엔드포인트 추가)

```java
// POST /api/v2/blogs/{id}/like
@PostMapping("/blogs/{id}/like")
public ResponseEntity<SocialToggleResponse> toggleBlogLike(@PathVariable UUID id) {
    String userId = authUtil.requireUserId();
    return ResponseEntity.ok(socialService.toggleBlogLike(id, userId));
}

// POST /api/v2/blogs/{id}/save
@PostMapping("/blogs/{id}/save")
public ResponseEntity<SocialToggleResponse> toggleBlogSave(@PathVariable UUID id) {
    String userId = authUtil.requireUserId();
    return ResponseEntity.ok(socialService.toggleBlogSave(id, userId));
}

// GET /api/v2/blogs/{id}/social
@GetMapping("/blogs/{id}/social")
public ResponseEntity<SocialStatusResponse> getBlogSocial(@PathVariable UUID id) {
    String userId = authUtil.getCurrentUserId();
    return ResponseEntity.ok(socialService.getBlogSocialStatus(id, userId));
}
```

### 2.7 Blog.java — commentsCount 필드 추가

**File**: `Blog.java` (MODIFY)

```java
// 기존 필드들 옆에 추가
@Column(name = "comments_count")
@Builder.Default
private Integer commentsCount = 0;
```

### 2.8 CommentService — BLOG case 구현

**File**: `CommentService.java` (MODIFY)

`updateCommentsCount()` 메서드의 BLOG case 변경:

```java
// Before:
case BLOG -> {} // Blog comment count tracked separately (no-op)

// After:
case BLOG -> blogRepository.findById(targetId).ifPresent(blog -> {
    long count = commentRepository.countByTargetTypeAndTargetId(CommentTargetType.BLOG, targetId);
    blog.setCommentsCount((int) count);
    blogRepository.save(blog);
});
```

### 2.9 BlogDetailResponse + BlogResponse — commentsCount 매핑

**File**: `BlogDetailResponse.java` (MODIFY)

```java
// 필드 추가
private Integer commentsCount;

// from() 메서드에 매핑 추가
.commentsCount(blog.getCommentsCount())
```

**File**: `BlogResponse.java` (MODIFY)

```java
// 필드 추가
private Integer commentsCount;

// from() 메서드에 매핑 추가
.commentsCount(blog.getCommentsCount())
```

---

## 3. Frontend Design (front-spotLine)

### 3.1 api.ts — "blog" 타입 확장

**File**: `src/lib/api.ts` (MODIFY)

toggleLike, toggleSave, fetchSocialStatus 함수의 type 파라미터 확장:

```typescript
// Before:
type: "spot" | "spotline"
const path = type === "spotline" ? "spotlines" : "spots";

// After:
type: "spot" | "spotline" | "blog"
const path = type === "blog" ? "blogs" : type === "spotline" ? "spotlines" : "spots";
```

3개 함수 모두 동일하게 변경.

### 3.2 useSocialStore.ts — "blog" 타입 추가

**File**: `src/store/useSocialStore.ts` (MODIFY)

```typescript
// Before:
type: "spot" | "spotline"

// After:
type: "spot" | "spotline" | "blog"
```

initSocialStatus, toggleLike, toggleSave, getItem, batchInitSocialStatus 모든 메서드의 type 파라미터 변경.

### 3.3 types/index.ts — commentsCount 추가

**File**: `src/types/index.ts` (MODIFY)

```typescript
// BlogResponse interface에 추가
export interface BlogResponse {
  // ... 기존 필드들
  commentsCount: number;  // NEW
}

// BlogDetailResponse는 extends BlogResponse이므로 자동 포함
```

### 3.4 blog/[slug]/page.tsx — SocialHydrator + 소셜 버튼

**File**: `src/app/blog/[slug]/page.tsx` (MODIFY)

```tsx
// Import 추가
import SocialHydrator from "@/components/social/SocialHydrator";
import BlogSocialBar from "@/components/blog/BlogSocialBar";

// JSX에 추가 (ViewTracker 아래)
<SocialHydrator
  type="blog"
  id={blog.id}
  likesCount={blog.likesCount}
  savesCount={blog.savesCount}
/>

// BlogHero 아래, blocks 위에 삽입
<BlogSocialBar blogId={blog.id} />

// CommentSection 수정
<CommentSection
  targetType="BLOG"
  targetId={blog.id}
  commentsCount={blog.commentsCount ?? 0}  // 하드코딩 제거
/>
```

### 3.5 New Component: BlogSocialBar

**File**: `src/components/blog/BlogSocialBar.tsx` (NEW)

Pattern: SpotLineBottomBar의 좋아요/저장 버튼 패턴 참고, blog 상세에 맞게 간소화.

```tsx
"use client";

import { Heart, Bookmark } from "lucide-react";
import { useSocialStore } from "@/store/useSocialStore";
import { useAuthStore } from "@/store/useAuthStore";
import LoginBottomSheet from "@/components/auth/LoginBottomSheet";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BlogSocialBarProps {
  blogId: string;
}

export default function BlogSocialBar({ blogId }: BlogSocialBarProps) {
  const item = useSocialStore((s) => s.getItem("blog", blogId));
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const toggleSave = useSocialStore((s) => s.toggleSave);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [showLogin, setShowLogin] = useState(false);
  const [loginMessage, setLoginMessage] = useState("");

  const liked = item?.liked ?? false;
  const saved = item?.saved ?? false;
  const likesCount = item?.likesCount ?? 0;

  const handleLike = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 좋아요를 남겨보세요");
      setShowLogin(true);
      return;
    }
    toggleLike("blog", blogId);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setLoginMessage("로그인하고 이 블로그를 저장해보세요");
      setShowLogin(true);
      return;
    }
    toggleSave("blog", blogId);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <button onClick={handleLike} className={cn(
        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        liked ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-gray-100"
      )}>
        <Heart className={cn("h-5 w-5", liked && "fill-current")} />
        <span>{likesCount}</span>
      </button>

      <button onClick={handleSave} className={cn(
        "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        saved ? "bg-amber-50 text-amber-600" : "text-gray-600 hover:bg-gray-100"
      )}>
        <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
        <span>{saved ? "저장됨" : "저장"}</span>
      </button>

      <LoginBottomSheet
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        message={loginMessage}
      />
    </div>
  );
}
```

---

## 4. File Change Summary

### 4.1 Backend — New Files (4)

| File | Type |
|------|------|
| `domain/entity/BlogLike.java` | Entity |
| `domain/entity/BlogSave.java` | Entity |
| `domain/repository/BlogLikeRepository.java` | Repository |
| `domain/repository/BlogSaveRepository.java` | Repository |

### 4.2 Backend — Modified Files (5)

| File | Changes |
|------|---------|
| `service/SocialService.java` | +3 메서드 (toggleBlogLike, toggleBlogSave, getBlogSocialStatus) + 3 Repository 주입 |
| `controller/SocialController.java` | +3 엔드포인트 (POST like, POST save, GET social) |
| `domain/entity/Blog.java` | +commentsCount 필드 |
| `service/CommentService.java` | BLOG case no-op → 실제 카운트 업데이트 |
| `dto/response/BlogDetailResponse.java` | +commentsCount 필드 + 매핑 |
| `dto/response/BlogResponse.java` | +commentsCount 필드 + 매핑 |

### 4.3 Frontend — New Files (1)

| File | Type |
|------|------|
| `components/blog/BlogSocialBar.tsx` | Client Component |

### 4.4 Frontend — Modified Files (4)

| File | Changes |
|------|---------|
| `lib/api.ts` | toggleLike/toggleSave/fetchSocialStatus type에 "blog" 추가, path 매핑 |
| `store/useSocialStore.ts` | type union에 "blog" 추가 |
| `types/index.ts` | BlogResponse에 commentsCount 추가 |
| `app/blog/[slug]/page.tsx` | +SocialHydrator, +BlogSocialBar, commentsCount 실제값 연동 |

---

## 5. API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v2/blogs/{id}/like` | Required | 좋아요 토글 |
| POST | `/api/v2/blogs/{id}/save` | Required | 저장 토글 |
| GET | `/api/v2/blogs/{id}/social` | Optional | 소셜 상태 조회 (비로그인 시 false/false) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-04-07 | Initial design — Blog Social Actions | Claude Code |
