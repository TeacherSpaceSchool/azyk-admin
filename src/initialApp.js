import { getProfile } from '../redux/actions/user'
import { setClient } from './gql/client'
import {getJWT, checkMobile, getCityCookie, unawaited, getViewModeCookie, isSameUrl} from './lib'
import uaParserJs from 'ua-parser-js';
import { getClientGqlSsr } from './getClientGQL'

export default async (ctx) => {
    //текущая ссылка
    let url;
    if (ctx.req) {
        url = ctx.req.url; // например "/products/123?sort=asc"
    } else {
        url = ctx.asPath;
    }
    //на сервере
    if(ctx.req) {
        //опредление устройства
        let ua = uaParserJs(ctx.req.headers['user-agent'])
        ctx.store.getState().app.isMobileApp = ['mobile', 'tablet'].includes(ua.device.type)||checkMobile(ua.ua)||ctx.req.headers['sec-ch-ua-mobile']==='?1'
        ctx.store.getState().app.device = ua.device
        //проверка аутентификации
        ctx.store.getState().user.authenticated = getJWT(ctx.req.headers.cookie)
        //тип отображения
        ctx.store.getState().app.viewMode = getViewModeCookie(ctx.req.headers.cookie)
        //пройдена аутентификации
        if(ctx.store.getState().user.authenticated) {
            //получения профиля
            ctx.store.getState().user.profile = await getProfile(getClientGqlSsr(ctx.req))
            //если админ
            if(ctx.store.getState().user.profile.role==='admin')
                ctx.store.getState().app.city = getCityCookie(ctx.req.headers.cookie)
            //если клиент
            if(ctx.store.getState().user.profile&&ctx.store.getState().user.profile.client) {
                let deviceModel
                if(ua.device.model)
                    deviceModel = ua.device.model
                else if(ua.ua) {
                    deviceModel = ua.ua.split(' (')
                        if(deviceModel[1]) {
                            deviceModel = deviceModel[1].split('; ')
                            if(deviceModel[2]) {
                                deviceModel = deviceModel[2].split(') ')
                                if(deviceModel[0])
                                    deviceModel = deviceModel[0]
                                else
                                    deviceModel = ''
                            }
                        }
                }
                unawaited(() => setClient({_id: ctx.store.getState().user.profile.client,
                    device: `${ua.device.vendor ? `${ua.device.vendor}-` : ''}${deviceModel} | ${ua.os.name ? `${ua.os.name}-` : ''}${ua.os.version ? ua.os.version : ''} | ${ua.browser.name ? `${ua.browser.name}-` : ''}${ua.browser.version ? ua.browser.version : ''}`
                }, getClientGqlSsr(ctx.req)))
            }
        }
        else {
            ctx.store.getState().user.profile = {}
        }
    }
    //только есл ине тот же маршрут
    if(!isSameUrl(ctx.store.getState().app.lastPath, url)) {
        //поиск
        ctx.store.getState().app.search = ''
        //сортровка
        ctx.store.getState().app.sort = '-createdAt'
        //фильтр
        ctx.store.getState().app.filter = ''
        //дата
        ctx.store.getState().app.date = ''
        //организация
        if(!ctx.store.getState().user.profile.organization)
            ctx.store.getState().app.organization = null
        else
            ctx.store.getState().app.organization = ctx.store.getState().user.profile.organization
    }
    //не админ установить город
    if(ctx.store.getState().user.profile.role&&ctx.store.getState().user.profile.role!=='admin')
        ctx.store.getState().app.city = ctx.store.getState().user.profile.city
    //загрузка
    ctx.store.getState().app.load = false
    //шторка
    ctx.store.getState().app.drawer = false
    //диалог
    ctx.store.getState().mini_dialog.show = false
    ctx.store.getState().mini_dialog.showFull = false
    //сохраняем как предыдущую ссылку
    ctx.store.getState().app.lastPath = url
}