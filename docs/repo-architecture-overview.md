# InvenTree 仓库架构速览

> 生成日期：2026-04-16  
> 范围：`/workspace/InvenTree` 当前仓库只读架构巡检摘要

## 总览

当前仓库是 **InvenTree**：一个开源库存管理系统。整体架构是典型的 **Django 后端 + React SPA 前端 + REST API + 后台任务 worker + 插件系统**。

核心分层：

```text
/workspace/InvenTree
├── src/backend/InvenTree/     # Django 项目与全部后端 apps
├── src/frontend/              # React + Vite + Mantine 前端 SPA / 插件 UI SDK
├── docs/                      # MkDocs 文档站点
├── contrib/                   # 容器、安装器、部署辅助
├── config/                    # 本地配置说明/模板区域
├── tasks.py                   # invoke 任务入口：安装、迁移、测试、构建、文档等
├── pyproject.toml             # Python lint/type/test 配置
└── .github/workflows/         # CI：后端、前端、文档、schema、安全等
```

## 技术栈

### 后端

后端主要技术：

- Python / Django
- Django：`5.2.13`
- Django REST Framework：`3.17.1`
- `drf-spectacular`：OpenAPI schema
- `django-q2`：后台任务队列
- Redis / `django-redis`：缓存与 worker broker
- PostgreSQL / MySQL / SQLite：多数据库支持
- `django-allauth`：账号、MFA、SSO / social / SAML / OpenID
- `django-oauth-toolkit`：OAuth2
- `structlog` / Sentry / OpenTelemetry：日志、错误追踪、链路追踪
- `django-dbbackup`：备份
- `django-flags`：feature flags
- `django-money`：金额/币种
- `django-mptt`：树结构，例如分类、库存位置

### 前端

前端主要技术：

- React：`19.2.x`
- TypeScript：`5.9.x`
- Vite：`7.3.x`
- Mantine：`8.2.x`
- TanStack Query
- Zustand
- Axios
- React Router
- Lingui i18n
- Sentry React
- Playwright E2E
- CodeMirror / FullCalendar / Recharts 等 UI 功能库

前端生产构建输出到：

```text
src/backend/InvenTree/web/static/web
```

也就是说，生产环境中 React SPA 会被构建为 Django 静态文件，由后端或反向代理提供。

## 后端架构

后端入口：

```text
src/backend/InvenTree/manage.py
src/backend/InvenTree/InvenTree/settings.py
src/backend/InvenTree/InvenTree/urls.py
src/backend/InvenTree/InvenTree/wsgi.py
```

`settings.py` 中的核心 Django apps：

```text
build
common
plugin
company
order
part
report
stock
users
machine
data_exporter
importer
web
generic
InvenTree
```

### 主要业务模块

| 模块 | 职责 |
|---|---|
| `part` | 零件、分类、BOM、价格、测试模板、关联件 |
| `stock` | 库存位置、库存项、库存追踪、库存测试 |
| `company` | 公司、供应商、客户、制造商、供应商件/制造商件 |
| `order` | 采购订单、销售订单、退货订单、订单行、发货、分配 |
| `build` | 生产/制造 build order、build line、build item |
| `report` | 报表、标签、模板、打印/生成 |
| `common` | 设置、通知、webhook、附件、项目代码、单位、邮件、后台任务状态 |
| `users` | 用户、组、权限、API token、owner/profile |
| `plugin` | 插件注册、配置、插件 API、插件 UI、插件静态资源 |
| `importer` | 数据导入 session、column mapping、row handling |
| `data_exporter` | 数据导出相关任务/序列化 |
| `machine` | machine driver / registry / machine settings |
| `web` | SPA 页面、静态 frontend 集成、兼容 URL |

### API 结构

顶层 URL 在：

```text
src/backend/InvenTree/InvenTree/urls.py
```

API 前缀为：

```text
/api/
```

主要 API 路由包括：

```text
/api/admin/
/api/bom/
/api/build/
/api/company/
/api/importer/
/api/label/
/api/machine/
/api/order/
/api/part/
/api/report/
/api/search/
/api/settings/
/api/stock/
/api/user/
/api/schema/
/api/version/
/api/auth/
```

后端采用 DRF。默认认证类包括：

- 自定义 API token：`users.authentication.ApiTokenAuthentication`
- Basic auth
- Session auth
- OAuth2 auth：`users.authentication.ExtendedOAuth2Authentication`

默认权限类包括：

- `IsAuthenticated`
- `ModelPermission`
- `RolePermission`
- OpenAPI token scope 匹配权限

## 前端架构

前端入口：

```text
src/frontend/src/main.tsx
src/frontend/src/views/MainView.tsx
src/frontend/src/App.tsx
src/frontend/src/router.tsx
```

### 运行模式

`main.tsx` 的关键职责：

1. 读取并合并 `window.INVENTREE_SETTINGS`
2. 在 dev / demo / current server 之间决定 API host
3. 初始化 Sentry
4. 暴露全局 React / Mantine / Lingui 对象给插件系统
5. 渲染 `<MainView />`

`MainView.tsx` 根据 viewport 与 mobile 设置，在以下视图之间切换：

```text
DesktopAppView
MobileAppView
```

### 路由

`router.tsx` 中是 lazy-loaded route tree。主要页面域：

```text
/home
/part
/stock
/manufacturing
/purchasing
/sales
/core
/settings
/notifications
/scan
/login
/logout
/mfa
/reset-password
```

### 状态与数据

- Axios 全局实例在 `src/frontend/src/App.tsx`
- QueryClient 使用 TanStack Query
- Zustand states 在 `src/frontend/src/states`
- API endpoint / shared UI SDK 在 `src/frontend/lib`
- 业务页面在 `src/frontend/src/pages`
- 业务表格在 `src/frontend/src/tables`
- 业务表单在 `src/frontend/src/forms`

### 插件 UI SDK

`src/frontend/lib` 是可发布包：

```json
{
  "name": "@inventreedb/ui"
}
```

该包主要给插件开发者使用，提供 InvenTree UI 类型、组件与接口。核心 UI 在运行时还会把 React / Mantine / Lingui 暴露到 `window`，供插件前端集成使用。

## 插件系统

插件系统是该项目的架构重点之一。

后端插件目录：

```text
src/backend/InvenTree/plugin/
```

包含：

```text
plugin/base/
plugin/builtin/
plugin/mixins/
plugin/samples/
plugin/testing/
plugin/api.py
plugin/registry.py
plugin/models.py
plugin/staticfiles.py
```

样例插件覆盖：

```text
event
icons
integration
locate
machines
mail
supplier
```

插件能力包括：

- API 扩展
- UI feature / action 扩展
- barcode
- supplier
- reports / labels
- events
- scheduled tasks
- machine drivers
- static files
- plugin settings / user settings

`settings.py` 中插件通过配置控制：

```python
PLUGINS_ENABLED
PLUGINS_MANDATORY
PLUGINS_INSTALL_DISABLED
PLUGIN_DEV_SLUG
PLUGIN_DEV_HOST
```

URL 层在插件启用时追加：

```python
urlpatterns.append(get_plugin_urls())
```

## 后台任务 / 缓存 / 部署

项目文档 `docs/docs/develop/architecture.md` 给出的推荐部署形态：

```text
Reverse Proxy
  ├── static/media file serving
  └── Gunicorn / Django WSGI
          ├── SQL Database
          ├── Redis cache
          └── Django Q2 worker
```

后台任务配置在 `settings.py`：

```python
Q_CLUSTER = {
    "name": "InvenTree",
    "workers": BACKGROUND_WORKER_COUNT,
    "timeout": BACKGROUND_WORKER_TIMEOUT,
    "retry": BACKGROUND_WORKER_RETRY,
    "orm": "default",
    "cache": "default",
}
```

如果启用全局 Redis cache，会将 Redis 也用作 Django Q broker。

SQLite 下会强制 worker 数为 1，避免数据库锁问题。

## 本地开发与任务入口

主要命令由根目录 `tasks.py` 提供，基于 `invoke`。

常见任务：

```bash
invoke install
invoke install --dev
invoke setup-dev
invoke update
invoke migrate
invoke server
invoke worker
invoke test
invoke test --runtest=company.test_api
invoke schema
invoke frontend-install
invoke frontend-build
invoke frontend-server
invoke frontend-test
invoke docs-server
invoke build-docs
```

前端直接命令位于 `src/frontend/package.json`：

```bash
yarn run dev
yarn run build
yarn run lib
yarn run extract
yarn run compile
```

前端开发文档推荐：

```bash
invoke int.frontend-install
invoke dev.server
invoke dev.frontend-server
```

## 测试 / CI

### 后端测试

`tasks.py` 中：

```bash
invoke dev.test --check --coverage --translations
invoke dev.test --pytest
invoke dev.test --check --migrations --report --coverage --translations
```

`pyproject.toml` 配置：

```toml
DJANGO_SETTINGS_MODULE = "InvenTree.settings"
pythonpath = ["src/backend/InvenTree"]
python_files = ["test*.py"]
timeout = "120"
```

### 前端测试

Playwright 配置：

```text
src/frontend/playwright.config.ts
```

本地运行：

```bash
cd src/frontend
npx playwright test --ui
```

Playwright 会启动：

- Vite frontend server：`localhost:5173`
- Django backend：`localhost:8000`
- worker：`invoke worker`

### CI

主要 workflow：

```text
.github/workflows/qc_checks.yaml
```

包括：

- pre-commit
- backend typecheck：`ty check`
- docs config / link checks
- API schema export
- backend unit / coverage tests
- DB matrix：SQLite / PostgreSQL / MySQL 相关
- frontend Playwright tests
- frontend build
- Zizmor GitHub Actions security check

## 代码风格 / 质量工具

Python：

- Ruff lint / format
- ty type checking
- pytest / Django test runner
- coverage
- djlint
- codespell
- isort 配置保留在 `pyproject.toml`

前端：

- TypeScript strict
- Vite build
- Lingui extract / compile
- Playwright
- Biome 配置文件存在于根目录 `biome.json`

## 架构要点

1. **后端 API-first**
   - Django 主要提供 REST API、认证、权限、后台任务、插件机制。
   - 前端绝大多数交互通过 API 完成。

2. **前端 SPA 与后端运行时解耦**
   - 前端生产构建为静态文件。
   - 运行时通过 `window.INVENTREE_SETTINGS` 注入 backend host、base URL、Sentry 等配置。

3. **插件系统是横切架构**
   - 后端 plugin registry + plugin models/settings。
   - 前端通过全局 React/Mantine/Lingui 与 `@inventreedb/ui` 暴露插件 UI 能力。
   - API、UI、事件、任务、供应商、报表、machine 等都可以被插件扩展。

4. **业务模型按库存领域拆分清晰**
   - `part`、`stock`、`company`、`order`、`build` 是核心业务域。
   - `common` 承担大量平台型能力：设置、通知、附件、任务、邮件、webhook。

5. **生产部署偏传统可靠**
   - WSGI / Gunicorn
   - SQL DB
   - Redis cache
   - Q2 background workers
   - static / media 由反向代理或文件服务处理

## 注意点 / 风险区

- **插件系统复杂度高**：后端 registry、静态资源、前端全局对象、API feature 多处耦合。改插件相关代码时需要同时看 backend + frontend + docs + sample plugins。
- **`common` 模块偏大**：包含设置、通知、webhook、附件、邮件、任务等平台能力，未来重构时要小心横向影响。
- **前端 shared lib 与 app 混仓**：`src/frontend/lib` 是可发布 SDK，`src/frontend/src` 是主应用；修改公共类型/组件要考虑插件 API 兼容性。
- **测试成本较高**：完整验证可能涉及 Django tests、schema、frontend build、Playwright、DB matrix。小改动应按影响面选择最小但充分的验证集。

## 后续改代码的定位建议

- 后端业务 bug：先看对应 app 的 `models.py` / `api.py` / `serializers.py` / `filters.py` / `test_*.py`
- 前端页面 bug：先看 `src/frontend/src/pages/<domain>`，再追到 `tables/`、`forms/`、`hooks/`、`states/`
- API contract 变化：同步检查 `urls.py`、app `api.py`、serializers、OpenAPI schema、frontend `ApiEndpoints`
- 插件相关：同时检查 `plugin/`、`src/frontend/lib`、`src/frontend/src/components/plugins`、sample plugin tests
- 构建/CI 问题：从 `tasks.py` 与 `.github/workflows/qc_checks.yaml` 对照本地命令复现

