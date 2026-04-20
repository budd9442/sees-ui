
async function test() {
    const START_URL = 'http://www.science.kln.ac.lk:8080/sfkn.aspx';
    console.log('Fetching', START_URL);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const res = await fetch(START_URL, { signal: controller.signal, redirect: 'follow' });
        clearTimeout(timeout);
        console.log('Status:', res.status);
        console.log('Final URL:', res.url);
        const text = await res.text();
        console.log('Length:', text.length);
        const hasUsername = /Usernametxt/i.test(text);
        const hasPassword = /PasswordTxt/i.test(text);
        const hasViewState = /__VIEWSTATE/i.test(text);
        console.log('Has Usernametxt:', hasUsername);
        console.log('Has PasswordTxt:', hasPassword);
        console.log('Has __VIEWSTATE:', hasViewState);
        if (!hasUsername) {
            console.log('Sample content (first 1000 chars):', text.substring(0, 1000));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
