const GOOGLE_GSI_SRC = 'https://accounts.google.com/gsi/client';

let gsiLoadPromise = null;

function loadGoogleScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (gsiLoadPromise) {
    return gsiLoadPromise;
  }

  gsiLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script'));
    document.head.appendChild(script);
  });

  return gsiLoadPromise;
}

export async function setupGoogleButton({ clientId, container, onCredential }) {
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID in frontend environment');
  }

  if (!container) {
    throw new Error('Google button container is not available');
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services is unavailable');
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response) => {
      if (response?.credential) {
        onCredential(response.credential);
      }
    },
  });

  container.innerHTML = '';
  window.google.accounts.id.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    width: 360,
  });
}
