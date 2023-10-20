const BASE_API_URL = 'http://127.0.0.1:8000/api';

async function fetchCSRFToken() {
    try {
        const response = await fetch(`${BASE_API_URL}/get-csrf-token`);
        const data = await response.json();
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
}

async function authenticatedFetch(url, options = {}) {
    const csrfToken = await fetchCSRFToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken;
    }

    return fetch(url, {
        ...options,
        headers: headers
    });
}

export { authenticatedFetch };