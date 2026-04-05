/** 클립보드에 URL 복사 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  }
}

/** Web Share API 지원 여부 */
export function isNativeShareSupported(): boolean {
  return typeof navigator !== "undefined" && !!navigator.share;
}

/** 네이티브 공유 */
export async function nativeShare(data: {
  title: string;
  text: string;
  url: string;
}): Promise<boolean> {
  if (!isNativeShareSupported()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch {
    return false;
  }
}

/** 카카오톡 공유 */
export function shareToKakao(data: {
  title: string;
  description: string;
  imageUrl?: string;
  webUrl: string;
}): void {
  const Kakao = (window as unknown as Record<string, unknown>).Kakao as {
    isInitialized: () => boolean;
    Share: {
      sendDefault: (params: Record<string, unknown>) => void;
    };
  } | undefined;

  if (!Kakao?.isInitialized?.()) return;

  Kakao.Share.sendDefault({
    objectType: "feed",
    content: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl || "",
      link: {
        webUrl: data.webUrl,
        mobileWebUrl: data.webUrl,
      },
    },
    buttons: [
      {
        title: "코스 보기",
        link: {
          webUrl: data.webUrl,
          mobileWebUrl: data.webUrl,
        },
      },
    ],
  });
}
