import { createApp } from 'vue'
import App from './index.vue'
import '../../style.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#popup_html')