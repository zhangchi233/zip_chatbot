async function fetchCSRFToken() {
    try {
        const response = await fetch(`/api/get-csrf-token`);
        const data = await response.json();
        console.log('Successfully fetched 2 csrf token')
        return data.csrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
}

async function authenticatedFetch(url, options = {}) {
    const csrfToken = await fetchCSRFToken();
    console.log('Adding CSRF token to headers:', csrfToken);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (csrfToken) {
        console.log('Adding CSRF token to headers:', csrfToken);
        headers['X-CSRFToken'] = csrfToken;
    }
    console.log('Fetching URL:', url);
    console.log('Headers', headers);
    return fetch(url, {
        ...options,
        headers: headers
    });
}

export { authenticatedFetch };