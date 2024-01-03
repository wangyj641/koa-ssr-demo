const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const static = require('koa-static')
const views = require('koa-views')

const app = new Koa()
const router = Router()

const world_html =
  '<div><a href="/">Index</a>&nbsp;&nbsp;&nbsp;<a href="/about">About</a>&nbsp;&nbsp;&nbsp;<a href="/world">World</a></div><h1>World</h1><script>var httpRequest = new XMLHttpRequest();//第一步：创建需要的对象\n' +
  'httpRequest.open(\'POST\', \'postdata\', true); //第二步：打开连接\n' +
  'httpRequest.setRequestHeader("Content-type","application/x-www-form-urlencoded");//设置请求头 注：post方式必须设置请求头（在建立连接后设置请求头）\n' +
  'httpRequest.send(\'name=teswe&ee=ef\');//发送请求 将情头体写在send中\n' +
  '/**\n' +
  ' * 获取数据后的处理程序\n' +
  ' */\n' +
  'httpRequest.onreadystatechange = function () {//请求后的回调接口，可将请求成功后要执行的程序写在其中\n' +
  '    if (httpRequest.readyState == 4 && httpRequest.status == 200) {//验证请求是否发送成功\n' +
  '        var json = httpRequest.responseText;//获取到服务端返回的数据\n' +
  '        console.log(json);\n' +
  '    }\n' +
  '};</script>'

// ctx.render need it
app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

app.use(bodyParser({
  enableTypes: ['json', 'form', 'text']
}))

app.use(static(
  __dirname + '/public'
))

app.keys = ['1233211234567']

const CONFIG = {
  key: 'FLB-SESSION', /** (string) cookie key (default is koa:sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
}

app.use(session(CONFIG, app))

app.use(async (ctx, next) => {
  console.log('---------------- go to session')
  // ignore favicon
  if (ctx.path === '/favicon.ico') return;
  let n = ctx.session.views || 0;
  ctx.session.views = ++n;
  ctx.session.token = ctx.session.token ? ctx.session.token : 'FLBNB'
  //console.log('ctx.session:', ctx.session)
  await next()
})

const index = async (ctx, next) => {
  console.log('---------------- go to index')
  //一些业务逻辑获得数据
  let renderData = {
    title: 'A Lovely Girl: Kelly Wang',
    num: '100',
    picture: '/img/wjy.jpg'
  }
  await ctx.render('index', renderData)
}

const about = async (ctx, next) => {
  console.log('---------------- go to about')
  ctx.body = '<div><a href="/">Index</a>&nbsp;&nbsp;&nbsp;<a href="/about">About</a>&nbsp;&nbsp;&nbsp;<a href="/world">World</a></div><h1>About</h1>'
}

const world = async (ctx, next) => {
  console.log('---------------- go to world')
  ctx.body = world_html
}

const postdata = async (ctx, next) => {
  console.log('解析后的请求体:', ctx.request.body)// { name: 'teswe', ee: 'ef' }
  console.log('原始的请求体:', ctx.request.rawBody)// name=teswe&ee=ef
  ctx.body = world_html
}

router.get('/', index)
router.get('/about', about)
router.get('/world', world)
router.post('/postdata', postdata)

app.use(router.routes(), router.allowedMethods())

app.listen(3000);
console.log('Koa server is listening  on 3000')
