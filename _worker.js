addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    // 获取原始请求的 URL
    const url = new URL(request.url)

    // 修改为 GitHub 的域名
    url.hostname = 'github.com'

    // 克隆原始请求并设置必要的头部
    const modifiedRequest = new Request(url, {
        method: request.method,
        headers: new Headers({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        }),
        body: request.body,
        redirect: 'follow'
    })

    try {
        // 发出请求并获得响应
        const response = await fetch(modifiedRequest)

        // 克隆响应并去掉不兼容的头部
        const modifiedResponse = new Response(response.body, response)
        modifiedResponse.headers.delete('Content-Security-Policy')
        modifiedResponse.headers.delete('X-Frame-Options')

        return modifiedResponse
    } catch (e) {
        return new Response('Error fetching GitHub: ' + e.message, { status: 502 })
    }
}
