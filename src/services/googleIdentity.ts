export async function loadGoogleIdentity(): Promise<void> {
  if (window.google) return;
  await new Promise<void>((resolve) => {
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = finish;
    script.onerror = finish;
    document.head.appendChild(script);
    window.setTimeout(finish, 3000);
  });
}
