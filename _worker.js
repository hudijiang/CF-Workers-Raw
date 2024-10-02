let token = "";
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname !== '/') {
      let githubRawUrl = 'https://raw.githubusercontent.com';
      
      // 如果路径中包含 GitHub 用户名，则直接拼接成 GitHub Raw 文件路径
      if (new RegExp(githubRawUrl, 'i').test(url.pathname)) {
        githubRawUrl += url.pathname.split(githubRawUrl)[1];
      } else {
        // 如果路径的第一级是 GitHub 用户名
        const pathnameParts = url.pathname.split('/');
        if (pathnameParts.length > 1) {
          const githubUsername = pathnameParts[1];
          
          githubRawUrl += `/${githubUsername}`;
          
          // 检查是否有仓库名
          if (pathnameParts.length > 2) {
            const githubRepo = pathnameParts[2];
            githubRawUrl += `/${githubRepo}`;
            
            // 检查是否有分支名
            if (pathnameParts.length > 3) {
              const githubBranch = pathnameParts[3];
              githubRawUrl += `/${githubBranch}`;
              
              // 加上后面的路径
              githubRawUrl += `/${pathnameParts.slice(4).join('/')}`;
            }
          }
        }
      }

      if (env.GH_TOKEN && env.TOKEN) {
        if (env.TOKEN == url.searchParams.get('token')) token = env.GH_TOKEN || token;
        else token = url.searchParams.get('token') || token;
      } else token = url.searchParams.get('token') || env.GH_TOKEN || env.TOKEN || token;

      const githubToken = token;

      if (!githubToken || githubToken == '') return new Response('TOKEN不能为空', { status: 400 });

      // 构建请求头
      const headers = new Headers();
      headers.append('Authorization', `token ${githubToken}`);

      // 发起请求
      const response = await fetch(githubRawUrl, { headers });

      // 检查请求是否成功
      if (response.ok) {
        return new Response(response.body, {
          status: response.status,
          headers: response.headers
        });
      } else {
        const errorText = env.ERROR || '无法获取文件，检查路径或TOKEN是否正确。';
        return new Response(errorText, { status: response.status });
      }

    } else {
      const envKey = env.URL302 ? 'URL302' : (env.URL ? 'URL' : null);
      if (envKey) {
        const URLs = await ADD(env[envKey]);
        const URL = URLs[Math.floor(Math.random() * URLs.length)];
        return envKey === 'URL302' ? Response.redirect(URL, 302) : fetch(new Request(URL, request));
      }
      // 首页返回 nginx 伪装页
      return new Response(await nginx(), {
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
        },
      });
    }
  }
};

async function nginx() {
  const text = `
  <!DOCTYPE html>
  <html>
  <head>
  <title>Welcome to nginx!</title>
  <style>
    body {
      width: 35em;
      margin: 0 auto;
      font-family: Tahoma, Verdana, Arial, sans-serif;
    }
  </style>
  </head>
  <body>
  <h1>Welcome to nginx!</h1>
  <p>If you see this page, the nginx web server is successfully installed and
  working. Further configuration is required.</p>
  
  <p>For online documentation and support please refer to
  <a href="http://nginx.org/">nginx.org</a>.<br/>
  Commercial support is available at
  <a href="http://nginx.com/">nginx.com</a>.</p>
  
  <p><em>Thank you for using nginx.</em></p>
  </body>
  </html>
  `;
  return text;
}

async function ADD(envadd) {
  var addtext = envadd.replace(/[	|"'\r\n]+/g, ',').replace(/,+/g, ',');	// 将空格、双引号、单引号和换行符替换为逗号
  if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
  if (addtext.charAt(addtext.length -1) == ',') addtext = addtext.slice(0, addtext.length - 1);
  const add = addtext.split(',');
  return add;
}
