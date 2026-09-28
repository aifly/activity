<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark"><span>A</span></div>
        <div>
          <strong>Activity OS</strong>
          <small>活动配置中心</small>
        </div>
      </div>

      <div class="workspace-select">
        <span class="workspace-icon">N</span>
        <div><small>当前业务线</small><strong>NN 活动中心</strong></div>
        <el-icon><ArrowDown /></el-icon>
      </div>

      <nav class="side-nav">
        <p class="nav-group-title">工作空间</p>
        <RouterLink
          v-for="item in navigationItems"
          :key="item.id"
          class="nav-item"
          :class="{ active: activeNav === item.id }"
          :to="navigationPaths[item.id]"
        >
          <el-icon><component :is="resolveIcon(item.icon)" /></el-icon>
          <span>{{ item.label }}</span>
          <em v-if="item.badge">{{ item.badge }}</em>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <RouterLink class="nav-item" :class="{ active: activeNav === 'settings' }" :to="navigationPaths.settings"><el-icon><Setting /></el-icon><span>系统设置</span></RouterLink>
        <RouterLink class="nav-item" :class="{ active: activeNav === 'help' }" :to="navigationPaths.help"><el-icon><QuestionFilled /></el-icon><span>帮助中心</span></RouterLink>
        <div class="user-card">
          <el-avatar :size="36">周</el-avatar>
          <div><strong>周沐</strong><small>活动策划</small></div>
          <el-icon><MoreFilled /></el-icon>
        </div>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <div class="breadcrumb-row">
          <span>活动中心</span><el-icon><ArrowRight /></el-icon><strong>{{ pageTitle }}</strong>
        </div>
        <div class="topbar-actions">
          <button class="icon-button"><el-icon><Search /></el-icon></button>
          <button class="icon-button has-dot"><el-icon><Bell /></el-icon></button>
          <el-divider direction="vertical" />
          <span class="environment"><i></i>正式环境</span>
        </div>
      </header>

      <div class="content">
        <section v-if="activeNav === 'overview'" class="page-section">
          <div class="page-heading">
            <div><p class="eyebrow">OVERVIEW</p><h1>活动运营工作台</h1><p>集中查看活动健康度、发布风险与实时运营数据。</p></div>
            <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建活动</el-button>
          </div>

          <div class="metric-grid">
            <article v-for="metric in metrics" :key="metric.label" class="metric-card">
              <div class="metric-top"><span :class="['metric-icon', metric.tone]"><el-icon><component :is="metric.icon" /></el-icon></span><em>{{ metric.trend }}</em></div>
              <strong>{{ metric.value }}</strong><p>{{ metric.label }}</p><small>{{ metric.hint }}</small>
            </article>
          </div>

          <div class="dashboard-grid">
            <section class="panel activity-progress-panel">
              <div class="panel-heading"><div><h2>近期活动</h2><p>按时间和风险优先级排序</p></div><el-button text type="primary" @click="handleNavigation('activities')">查看全部</el-button></div>
              <div v-for="activity in activities.slice(0, 3)" :key="activity.id" class="progress-activity">
                <div class="activity-symbol" :class="statusTone(activity.status)">{{ activity.name.slice(0, 1) }}</div>
                <div class="progress-copy"><div><strong>{{ activity.name }}</strong><StatusTag :status="activity.status" /></div><p>{{ activity.startTime }} — {{ activity.endTime }}</p><el-progress :percentage="activityProgress(activity)" :show-text="false" :stroke-width="6" /></div>
                <span>{{ activity.users }}</span>
              </div>
            </section>

            <section class="panel risk-panel">
              <div class="panel-heading"><div><h2>发布风险</h2><p>来自自动配置检查</p></div><span class="risk-count">3 项</span></div>
              <div v-for="risk in releaseRisks" :key="risk.title" class="risk-item">
                <span :class="['risk-dot', risk.level]"><el-icon><component :is="risk.icon" /></el-icon></span>
                <div><strong>{{ risk.title }}</strong><p>{{ risk.description }}</p></div>
                <el-icon><ArrowRight /></el-icon>
              </div>
              <button class="full-link" @click="handleNavigation('publish')">进入发布检查 <el-icon><ArrowRight /></el-icon></button>
            </section>
          </div>
        </section>

        <section v-else-if="activeNav === 'activities'" class="page-section">
          <div class="page-heading">
            <div><p class="eyebrow">ACTIVITIES</p><h1>活动管理</h1><p>管理活动生命周期、模板、负责人和发布状态。</p></div>
            <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建活动</el-button>
          </div>

          <section class="panel table-panel">
            <div class="filter-row">
              <el-input v-model="activityKeyword" :prefix-icon="Search" placeholder="搜索活动名称 / ID / 编码" clearable />
              <el-select v-model="activityStatusFilter" placeholder="全部状态"><el-option label="全部状态" value="全部" /><el-option v-for="status in statusOptions" :key="status" :label="status" :value="status" /></el-select>
              <el-select v-model="templateFilter" placeholder="全部模板"><el-option label="全部模板" value="全部" /><el-option v-for="template in templateOptions" :key="template" :label="template" :value="template" /></el-select>
              <el-button :icon="Refresh" @click="resetActivityFilters">重置</el-button>
            </div>
            <el-table :data="filteredActivities" class="activity-table">
              <el-table-column label="活动" min-width="270">
                <template #default="scope"><div class="activity-name-cell"><span class="list-symbol">{{ scope.row.name.slice(0, 1) }}</span><div><strong>{{ scope.row.name }}</strong><small>ID {{ scope.row.id }} · {{ scope.row.code }}</small></div></div></template>
              </el-table-column>
              <el-table-column prop="template" label="模板" min-width="150" />
              <el-table-column label="状态" width="105"><template #default="scope"><StatusTag :status="scope.row.status" /></template></el-table-column>
              <el-table-column prop="device" label="终端" width="100" />
              <el-table-column label="活动时间" min-width="210"><template #default="scope"><div class="date-cell"><span>{{ scope.row.startTime }}</span><small>至 {{ scope.row.endTime }}</small></div></template></el-table-column>
              <el-table-column label="负责人" width="110"><template #default="scope"><div class="owner-cell"><el-avatar :size="26">{{ scope.row.owner.slice(0, 1) }}</el-avatar>{{ scope.row.owner }}</div></template></el-table-column>
              <el-table-column label="操作" width="150" fixed="right"><template #default="scope"><el-button link type="primary" @click="editActivity(scope.row)">配置</el-button><el-button link @click="duplicateActivity(scope.row)">复制</el-button><el-button link><el-icon><MoreFilled /></el-icon></el-button></template></el-table-column>
            </el-table>
            <div class="pagination-row"><span>共 {{ filteredActivities.length }} 个活动</span><el-pagination background layout="prev, pager, next" :total="filteredActivities.length" :page-size="10" /></div>
          </section>
        </section>

        <section v-else-if="activeNav === 'editor'" class="page-section editor-page">
          <div class="editor-heading">
            <div><button class="back-button" @click="handleNavigation('activities')"><el-icon><ArrowLeft /></el-icon></button><div><div class="title-line"><h1>PUBG 金秋双节补给行动</h1><span class="draft-pill">草稿已保存</span></div><p>ID 11025 · PUBG_AUTUMN_2026</p></div></div>
            <div><el-button :icon="View" @click="previewDrawer = true">预览</el-button><el-button @click="saveDraft">保存草稿</el-button><el-button type="primary" :icon="Promotion" @click="handleNavigation('publish')">提交发布</el-button></div>
          </div>

          <div class="editor-tabs">
            <button v-for="tab in editorTabs" :key="tab.id" :class="{ active: editorTab === tab.id }" @click="editorTab = tab.id"><span>{{ tab.index }}</span>{{ tab.label }}<em v-if="tab.state">{{ tab.state }}</em></button>
          </div>

          <div v-if="editorTab === 'base'" class="editor-layout base-layout">
            <section class="panel form-panel">
              <div class="section-title"><span>01</span><div><h2>基础信息</h2><p>定义活动身份、时间和生效范围</p></div></div>
              <el-form label-position="top" :model="activityForm" class="config-form">
                <div class="form-grid"><el-form-item label="活动名称"><el-input v-model="activityForm.name" /></el-form-item><el-form-item label="活动编码"><el-input v-model="activityForm.code" disabled /></el-form-item></div>
                <div class="form-grid"><el-form-item label="展示时间"><el-date-picker v-model="activityForm.displayTime" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" /></el-form-item><el-form-item label="生效时区"><el-select v-model="activityForm.timezone"><el-option label="北京时间 UTC+8" value="Asia/Shanghai" /></el-select></el-form-item></div>
                <div class="form-grid"><el-form-item label="终端范围"><el-checkbox-group v-model="activityForm.devices"><el-checkbox-button label="PC" value="PC" /><el-checkbox-button label="H5" value="H5" /></el-checkbox-group></el-form-item><el-form-item label="活动负责人"><el-select v-model="activityForm.owner"><el-option label="周沐" value="周沐" /><el-option label="林栖" value="林栖" /></el-select></el-form-item></div>
              </el-form>
            </section>
            <aside class="panel template-panel">
              <div class="section-title compact"><span>02</span><div><h2>活动模板</h2><p>模板决定可使用的玩法模块</p></div></div>
              <div v-for="template in templateCards" :key="template.name" class="template-card" :class="{ selected: activityForm.template === template.name }" @click="activityForm.template = template.name">
                <div :class="['template-preview', template.tone]"><i></i><i></i><i></i></div>
                <div><strong>{{ template.name }}</strong><p>{{ template.description }}</p><small>{{ template.modules }} 个标准模块</small></div>
                <el-icon v-if="activityForm.template === template.name"><CircleCheckFilled /></el-icon>
              </div>
              <div class="template-note"><el-icon><InfoFilled /></el-icon><p>模板上线后仍可调整文案、素材和规则，但不建议变更核心玩法类型。</p></div>
            </aside>
          </div>

          <div v-else-if="editorTab === 'modules'" class="module-editor-grid">
            <section class="module-library panel">
              <div class="panel-heading"><div><h2>模块库</h2><p>拖入页面或点击添加</p></div><el-input v-model="moduleKeyword" :prefix-icon="Search" placeholder="搜索模块" /></div>
              <div class="library-list">
                <button v-for="item in availableModules" :key="item.type" @click="addModule(item)"><span :class="['module-icon', item.type]"><el-icon><component :is="item.icon" /></el-icon></span><div><strong>{{ item.name }}</strong><small>{{ item.description }}</small></div><el-icon><Plus /></el-icon></button>
              </div>
            </section>

            <section class="canvas panel">
              <div class="canvas-toolbar"><div><h2>PC 页面结构</h2><span>1360px 设计宽度</span></div><div><button class="device-button active"><el-icon><Monitor /></el-icon></button><button class="device-button"><el-icon><Iphone /></el-icon></button><el-divider direction="vertical" /><span>80%</span></div></div>
              <div class="page-canvas">
                <div class="hero-block"><span>NN</span><div><small>PUBG</small><strong>金秋双节补给行动</strong><em>9.25 - 10.11</em></div></div>
                <div class="canvas-nav"><span v-for="module in navigableModules" :key="module.id">{{ module.name }}</span></div>
                <div v-for="(module, index) in modules" :key="module.id" class="canvas-module" :class="{ disabled: !module.enabled, selected: selectedModuleId === module.id }" @click="openModuleConfig(module)">
                  <div class="drag-handle"><el-icon><Rank /></el-icon></div>
                  <span :class="['module-icon', module.type]"><el-icon><component :is="moduleTypeIcons[module.type]" /></el-icon></span>
                  <div><small>MODULE {{ String(index + 1).padStart(2, '0') }}</small><strong>{{ module.name }}</strong><p>{{ module.description }}</p><em v-if="module.warning"><el-icon><Warning /></el-icon>{{ module.warning }}</em></div>
                  <div class="module-actions"><button class="configure-button" @click.stop="openModuleConfig(module)"><el-icon><EditPen /></el-icon><span>配置</span></button><el-switch v-model="module.enabled" :disabled="module.type === 'background'" @click.stop /><button :disabled="module.type === 'background' || index <= 1" @click.stop="moveModule(index, -1)"><el-icon><ArrowUp /></el-icon></button><button :disabled="module.type === 'background' || index === modules.length - 1" @click.stop="moveModule(index, 1)"><el-icon><ArrowDown /></el-icon></button><button :disabled="module.type === 'background'" @click.stop="removeModule(index)"><el-icon><Delete /></el-icon></button></div>
                </div>
                <button class="add-section-button" @click="focusModuleLibrary"><el-icon><Plus /></el-icon>添加业务模块</button>
              </div>
            </section>

          </div>

          <div v-else-if="editorTab === 'description'" class="description-editor-grid">
            <section class="panel description-form-panel">
              <div class="section-title">
                <span>05</span>
                <div>
                  <h2>活动说明正文</h2>
                  <p>正文内容将按录入时的换行、编号和段落间距原样展示。</p>
                </div>
              </div>

              <div class="description-toolbar">
                <div>
                  <span class="plain-text-badge"><el-icon><Document /></el-icon>纯文本格式</span>
                  <small>无需单独配置标题、副标题或说明项</small>
                </div>
                <span>{{ activityRulesText.length }} 字</span>
              </div>

              <el-input
                v-model="activityRulesText"
                class="rules-textarea"
                type="textarea"
                :rows="24"
                resize="vertical"
                placeholder="请输入完整活动说明。换行、空行、序号和括号层级都会保留。"
              />

              <div class="description-help">
                <el-icon><InfoFilled /></el-icon>
                <p>活动页展示时使用 <code>white-space: pre-wrap</code>，不会把每一段拆成副文本，也不会自动改写编号。</p>
              </div>
            </section>

            <aside class="panel description-preview-panel">
              <div class="description-preview-heading">
                <div><small>页面效果</small><h2>活动说明预览</h2></div>
                <span>PC / H5 同格式</span>
              </div>
              <div class="activity-rules-preview">
                <pre>{{ activityRulesText || '暂未填写活动说明' }}</pre>
              </div>
            </aside>
          </div>
        </section>

        <section v-else-if="activeNav === 'tasks'" class="page-section">
          <div class="page-heading"><div><p class="eyebrow">MISSION CENTER</p><h1>任务中心</h1><p>任务类型、执行器、周期和奖励相互独立，避免用名称推断业务行为。</p></div><el-button type="primary" :icon="Plus" @click="openTaskDialog">新建任务</el-button></div>
          <div class="summary-strip"><div><span class="summary-icon blue"><el-icon><List /></el-icon></span><p>任务总数<strong>{{ tasks.length }}</strong></p></div><div><span class="summary-icon green"><el-icon><CircleCheck /></el-icon></span><p>已启用<strong>{{ enabledTaskCount }}</strong></p></div><div><span class="summary-icon orange"><el-icon><Warning /></el-icon></span><p>待完善<strong>2</strong></p></div><div><span class="summary-icon violet"><el-icon><Connection /></el-icon></span><p>执行器<strong>6</strong></p></div></div>
          <section class="panel table-panel">
            <div class="filter-row"><el-input v-model="taskKeyword" :prefix-icon="Search" placeholder="搜索任务名称或类型" /><el-select v-model="taskCycleFilter"><el-option label="全部周期" value="全部" /><el-option label="每日" value="每日" /><el-option label="单次" value="单次" /><el-option label="活动累计" value="活动累计" /></el-select><div class="filter-spacer"></div><el-button :icon="Sort">调整排序</el-button></div>
            <el-table :data="filteredTasks">
              <el-table-column label="任务" min-width="250"><template #default="scope"><div class="task-cell"><span>{{ scope.row.id }}</span><div><strong>{{ scope.row.name }}</strong><small>taskType {{ scope.row.id }}</small></div></div></template></el-table-column>
              <el-table-column label="执行器" width="150"><template #default="scope"><span class="executor-pill">{{ scope.row.executor }}</span></template></el-table-column>
              <el-table-column prop="cycle" label="周期" width="110" />
              <el-table-column label="目标" width="110"><template #default="scope"><strong>{{ scope.row.target.toLocaleString() }}</strong></template></el-table-column>
              <el-table-column prop="condition" label="前置条件" width="120" />
              <el-table-column prop="reward" label="奖励" min-width="160" />
              <el-table-column label="状态" width="90"><template #default="scope"><el-switch v-model="scope.row.enabled" /></template></el-table-column>
              <el-table-column label="操作" width="120"><template #default><el-button link type="primary">编辑</el-button><el-button link>复制</el-button></template></el-table-column>
            </el-table>
          </section>
        </section>

        <section v-else-if="activeNav === 'prizes'" class="page-section">
          <div class="page-heading"><div><p class="eyebrow">REWARD HUB</p><h1>奖品与奖池</h1><p>统一管理库存、概率、用户限中和奖励履约。</p></div><div><el-button :icon="Box">库存导入</el-button><el-button type="primary" :icon="Plus" @click="openPrizeDialog">添加奖品</el-button></div></div>
          <div class="pool-tabs"><button class="active"><span class="pool-orb normal"></span>普通奖池<em>3</em></button><button><span class="pool-orb premium"></span>至臻奖池<em>2</em></button><button><el-icon><Plus /></el-icon>新建奖池</button><div><strong>概率合计 100%</strong><span>校验通过</span></div></div>
          <section class="panel table-panel prize-panel">
            <el-table :data="prizes">
              <el-table-column label="奖品" min-width="260"><template #default="scope"><div class="prize-cell"><span :class="['prize-thumb', prizeTone(scope.row.type)]"><el-icon><component :is="prizeIcon(scope.row.type)" /></el-icon></span><div><strong>{{ scope.row.name }}</strong><small>ID {{ scope.row.id }} · {{ scope.row.type }}</small></div></div></template></el-table-column>
              <el-table-column prop="pool" label="所属奖池" width="130" />
              <el-table-column label="中奖概率" width="130"><template #default="scope"><strong class="probability">{{ scope.row.probability }}</strong></template></el-table-column>
              <el-table-column label="库存" width="150"><template #default="scope"><div class="stock-cell"><strong>{{ scope.row.stock.toLocaleString() }}</strong><el-progress :percentage="stockPercentage(scope.row)" :show-text="false" :stroke-width="4" /></div></template></el-table-column>
              <el-table-column label="每人限中" width="110"><template #default="scope">{{ scope.row.limit }} 次</template></el-table-column>
              <el-table-column label="状态" width="100"><template #default="scope"><span class="online-pill"><i></i>{{ scope.row.status }}</span></template></el-table-column>
              <el-table-column label="操作" width="130"><template #default><el-button link type="primary">编辑</el-button><el-button link>记录</el-button></template></el-table-column>
            </el-table>
            <div class="probability-footer"><el-icon><InfoFilled /></el-icon><span>概率仅用于配置和公示；真实抽奖、库存扣减和奖励发放必须由服务端执行。</span><strong>普通奖池合计：100.0000%</strong></div>
          </section>
        </section>

        <section v-else-if="activeNav === 'publish'" class="page-section publish-page">
          <div class="page-heading"><div><p class="eyebrow">RELEASE CENTER</p><h1>发布审核</h1><p>发布前自动检查配置完整性、业务风险与终端兼容性。</p></div><el-button type="primary" :icon="Promotion" :disabled="validationIssues > 0">确认发布</el-button></div>
          <div class="release-banner"><div class="release-score"><strong>86</strong><span>配置健康分</span></div><div><h2>PUBG 金秋双节补给行动</h2><p>版本 v0.9.6 · 最后保存于 15:42 · 提交人 周沐</p><div class="release-tags"><span>PC + H5</span><span>正式环境</span><span>定时发布</span></div></div><div class="release-time"><small>计划发布时间</small><strong>2026-09-25</strong><span>00:00:00 UTC+8</span></div></div>
          <div class="check-grid">
            <section class="panel checklist-panel"><div class="panel-heading"><div><h2>自动检查结果</h2><p>共 12 项规则，9 项通过</p></div><el-button :icon="Refresh" @click="runValidation">重新检查</el-button></div><div v-for="check in validationChecks" :key="check.title" class="check-row"><span :class="['check-icon', check.status]"><el-icon><component :is="check.status === 'pass' ? CircleCheckFilled : check.status === 'warning' ? WarningFilled : CircleCloseFilled" /></el-icon></span><div><strong>{{ check.title }}</strong><p>{{ check.description }}</p></div><em :class="check.status">{{ check.label }}</em><el-icon><ArrowRight /></el-icon></div></section>
            <aside class="panel release-side"><h2>审核流程</h2><div class="approval-step done"><span><el-icon><Check /></el-icon></span><div><strong>配置提交</strong><p>周沐 · 今天 15:42</p></div></div><div class="approval-step current"><span>2</span><div><strong>业务审核</strong><p>等待活动负责人确认</p></div></div><div class="approval-step"><span>3</span><div><strong>奖品与风控审核</strong><p>将在业务审核后开始</p></div></div><div class="approval-step"><span>4</span><div><strong>定时发布</strong><p>2026-09-25 00:00</p></div></div><el-divider /><h3>发布说明</h3><el-input v-model="releaseNote" type="textarea" :rows="4" placeholder="填写本次发布内容和注意事项" /><el-button class="submit-review" type="primary" @click="submitReview">提交业务审核</el-button></aside>
          </div>
        </section>

        <section v-else class="empty-page panel">
          <span><el-icon><Tools /></el-icon></span><h1>{{ pageTitle }}</h1><p>第一版原型暂未展开该模块，信息架构入口已经保留。</p><el-button type="primary" @click="handleNavigation('overview')">返回工作台</el-button>
        </section>
      </div>
    </main>

    <el-dialog v-model="createDialogVisible" title="新建活动" width="560px">
      <el-form label-position="top" :model="newActivityForm"><el-form-item label="活动名称"><el-input v-model="newActivityForm.name" placeholder="例如：PUBG 冬日补给行动" /></el-form-item><el-form-item label="活动模板"><el-select v-model="newActivityForm.template" class="full-width"><el-option v-for="template in templateOptions" :key="template" :label="template" :value="template" /></el-select></el-form-item><el-form-item label="终端范围"><el-radio-group v-model="newActivityForm.device"><el-radio-button label="PC + H5" value="PC + H5" /><el-radio-button label="仅 PC" value="仅 PC" /><el-radio-button label="仅 H5" value="仅 H5" /></el-radio-group></el-form-item></el-form>
      <template #footer><el-button @click="createDialogVisible = false">取消</el-button><el-button type="primary" @click="createActivity">创建并配置</el-button></template>
    </el-dialog>

    <el-drawer v-model="moduleConfigDrawer" size="min(620px, 100vw)" :with-header="false" class="module-config-drawer">
      <template v-if="selectedModule">
        <div class="drawer-config-header">
          <div class="drawer-module-identity">
            <span :class="['module-icon', selectedModule.type]"><el-icon><component :is="moduleTypeIcons[selectedModule.type]" /></el-icon></span>
            <div><small>模块配置</small><h2>{{ selectedModule.name }}</h2><p>{{ selectedModule.description }}</p></div>
          </div>
          <div class="drawer-header-actions"><span>{{ selectedModule.enabled ? '已启用' : '已停用' }}</span><el-switch v-model="selectedModule.enabled" :disabled="selectedModule.type === 'background'" /><button @click="moduleConfigDrawer = false"><el-icon><Close /></el-icon></button></div>
        </div>

        <div class="drawer-config-body">
          <template v-if="selectedModule.type === 'background'">
            <div class="background-config-intro">
              <el-icon><Picture /></el-icon>
              <p>背景位于所有业务模块下方，不生成导航锚点。PC 和 H5 素材相互独立。</p>
            </div>
            <div class="background-device-tabs">
              <button :class="{ active: backgroundDevice === 'pc' }" @click="backgroundDevice = 'pc'"><el-icon><Monitor /></el-icon>PC 背景</button>
              <button :class="{ active: backgroundDevice === 'h5' }" @click="backgroundDevice = 'h5'"><el-icon><Iphone /></el-icon>H5 背景</button>
            </div>
              <el-form label-position="top" class="property-form background-property-form drawer-form-grid">
              <el-form-item class="drawer-form-full" label="背景素材">
                <el-upload class="background-uploader" drag action="#" :auto-upload="false" :multiple="true" :show-file-list="false" accept="image/png,image/jpeg,image/webp" :on-change="handleBackgroundUpload">
                  <el-icon class="upload-icon"><UploadFilled /></el-icon>
                  <div class="upload-copy"><strong>上传{{ backgroundDevice === 'pc' ? ' PC ' : ' H5 ' }}背景图</strong><p>支持 PNG、JPG、WebP，可选择多张分段图</p></div>
                </el-upload>
              </el-form-item>
            </el-form>
            <div class="drawer-section-heading"><div><h3>已上传背景</h3><p>图片按列表顺序从上到下拼接</p></div><el-button :icon="Sort">调整排序</el-button></div>
            <div class="background-segment-list drawer-segment-list">
              <div v-for="(segment, index) in currentBackgroundSegments" :key="segment.name">
                <button class="segment-preview-button" :aria-label="`预览图片 ${segment.name}`" @click="previewBackgroundSegment(segment)">
                  <img class="segment-thumb segment-preview-image" :src="segment.url" :alt="segment.name" />
                </button>
                <p><strong>{{ segment.name }}</strong><small>{{ segment.size }}</small></p>
                <em>{{ index === 0 ? '首屏' : index === currentBackgroundSegments.length - 1 ? '页尾' : `分段 ${index + 1}` }}</em>
                <el-icon><Rank /></el-icon>
              </div>
              <div v-if="currentBackgroundSegments.length === 0" class="background-empty-state">尚未上传背景图，请先上传 PC 或 H5 背景素材。</div>
            </div>
          </template>

          <template v-else>
            <div class="drawer-section-heading"><div><h3>展示设置</h3><p>控制模块在活动页面中的名称、终端和可见范围</p></div></div>
            <el-form label-position="top" class="property-form drawer-form-grid">
              <el-form-item label="导航名称"><el-input v-model="selectedModule.name" /></el-form-item>
              <el-form-item label="展示终端"><el-select v-model="selectedModule.device"><el-option label="PC + H5" value="PC + H5" /><el-option label="仅 PC" value="仅 PC" /><el-option label="仅 H5" value="仅 H5" /></el-select></el-form-item>
              <el-form-item class="drawer-form-full" label="模块说明"><el-input v-model="selectedModule.description" type="textarea" :rows="4" /></el-form-item>
              <el-form-item label="可见时间"><el-select model-value="跟随活动时间"><el-option label="跟随活动时间" value="跟随活动时间" /><el-option label="自定义时间" value="自定义时间" /></el-select></el-form-item>
            </el-form>
            <div class="drawer-section-heading gameplay-heading"><div><h3>玩法配置</h3><p>进入对应配置中心管理任务、奖池或奖励规则</p></div></div>
            <button class="drawer-config-link" @click="jumpToModuleConfig(selectedModule.type)"><span :class="['module-icon', selectedModule.type]"><el-icon><component :is="moduleTypeIcons[selectedModule.type]" /></el-icon></span><div><strong>配置{{ selectedModule.name }}玩法</strong><p>编辑数据来源、业务条件、奖励和异常状态</p></div><el-icon><ArrowRight /></el-icon></button>
            <div class="property-tips"><strong>配置提示</strong><p>关闭模块只影响页面展示，不会自动停止对应的任务统计或奖励发放。</p></div>
          </template>
        </div>

        <div class="drawer-config-footer"><el-button @click="moduleConfigDrawer = false">取消</el-button><el-button type="primary" @click="saveModuleConfig">保存模块配置</el-button></div>
      </template>
    </el-drawer>

    <el-dialog v-model="backgroundPreviewVisible" :title="backgroundPreviewName" width="min(920px, 92vw)" class="background-preview-dialog">
      <img class="background-preview-full-image" :src="backgroundPreviewUrl" :alt="backgroundPreviewName" />
    </el-dialog>

    <el-drawer v-model="previewDrawer" title="活动实时预览" size="520px"><div class="preview-device"><div class="preview-browser"><span></span><span></span><span></span><small>activity.nn.com/preview/11025</small></div><div class="preview-hero"><small>PUBG</small><strong>金秋双节<br />补给行动</strong><span>9.25 — 10.11</span></div><div class="preview-nav"><span v-for="module in navigableModules" :key="module.id">{{ module.name }}</span></div><div v-for="module in contentModules" :key="module.id" class="preview-section"><span :class="['module-icon', module.type]"><el-icon><component :is="moduleTypeIcons[module.type]" /></el-icon></span><div><strong>{{ module.name }}</strong><p>{{ module.description }}</p></div></div><div class="preview-rules"><strong>活动说明</strong><pre>{{ activityRulesText }}</pre></div></div></el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, h, reactive, ref, type Component } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bell, Box, Calendar, Check, Close,
  CircleCheck, CircleCheckFilled, CircleCloseFilled, Coin, Connection, DataBoard,
  Delete, Discount, Document, EditPen, Goods, Grid, Iphone, InfoFilled, List,
  MagicStick, Medal, Monitor, MoreFilled, Picture, Plus, Present, Promotion,
  QuestionFilled, Rank, Refresh, Search, SetUp, Setting, Sort, Star, Tickets,
  Tools, TrendCharts, UploadFilled, User, View, Warning, WarningFilled,
} from '@element-plus/icons-vue'
import { activities as seedActivities, initialModules, initialPrizes, initialTasks, navigationItems } from './mock'
import { navigationPaths } from './navigation'
import type { ActivityModule, ActivityRecord, ActivityStatus, ModuleType } from './types'

const iconMap: Record<string, Component> = { DataBoard, Calendar, SetUp, List, Present, Picture, Promotion, TrendCharts }
const moduleTypeIcons: Record<ModuleType, Component> = { background: Picture, exchange: Goods, sign: Calendar, task: List, lottery: MagicStick, invite: User, community: Connection, event: Medal, rules: Document }
const pageTitleMap: Record<string, string> = { overview: '工作台', activities: '活动管理', editor: '页面编排', tasks: '任务中心', prizes: '奖品与奖池', assets: '素材中心', publish: '发布审核', analytics: '数据看板', settings: '系统设置', help: '帮助中心' }
const statusOptions: ActivityStatus[] = ['进行中', '待发布', '草稿', '已结束']
const templateOptions = ['经典补给模板', '完整互动模板', '金秋小队模板', '社区盲盒模板']
const route = useRoute()
const router = useRouter()
const activeNav = computed(() => String(route.meta.navId ?? 'overview'))
const activityKeyword = ref('')
const activityStatusFilter = ref('全部')
const templateFilter = ref('全部')
const taskKeyword = ref('')
const taskCycleFilter = ref('全部')
const moduleKeyword = ref('')
const backgroundDevice = ref<'pc' | 'h5'>('pc')
const editorTab = ref('modules')
const selectedModuleId = ref('task')
const createDialogVisible = ref(false)
const previewDrawer = ref(false)
const moduleConfigDrawer = ref(false)
const backgroundPreviewVisible = ref(false)
const backgroundPreviewUrl = ref('')
const backgroundPreviewName = ref('背景图片预览')
const releaseNote = ref('完成金秋双节活动首发配置，包含普通/至臻双奖池、小队周任务和节日签到奖励。')
const activities = ref<ActivityRecord[]>(structuredClone(seedActivities))
const modules = ref<ActivityModule[]>(structuredClone(initialModules))
const tasks = ref(structuredClone(initialTasks))
const prizes = ref(structuredClone(initialPrizes))

const activityForm = reactive({ name: 'PUBG 金秋双节补给行动', code: 'PUBG_AUTUMN_2026', displayTime: [new Date(2026, 8, 25), new Date(2026, 9, 11, 23, 59)], timezone: 'Asia/Shanghai', devices: ['PC', 'H5'], owner: '周沐', template: '金秋小队模板' })
const newActivityForm = reactive({ name: '', template: '完整互动模板', device: 'PC + H5' })
const backgroundSegments = reactive({ pc: [], h5: [] } as Record<'pc' | 'h5', Array<{ name: string; size: string; url: string }>>)
const activityRulesText = ref(`活动时间：9月21日-10月18日

1.积分规则：用户可通过完成活动任务等方式获得并累计活动积分，活动积分可继承至后续NN x PUBG 活动中使用；

2.活动规则：
（1）参与活动前请将NN客户端升级为最新版本，以免出现异常情况给您带来不必要的损失；
（2）积分兑换奖品库存北京时间每日 10:00、20:00 更新，数量有限，兑完即止；
（3）活动任务中游戏累计存活数据同步会有延迟，请在游戏对局结束10分钟后再次尝试领取奖励；

3.奖品发放：
（1）CDK兑换激活有效期（过期不补）：游戏G-coin、游戏道具：2026年11月1日 00:00；
（2）虚拟奖品：游戏G-coin和道具CDK需前往游戏内进行兑换；京东卡道具请前往京东官方渠道进行兑换；

4.违规处理：若在活动过程中发现用户采用扰乱系统、实施网络攻击、恶意套现或利用系统规则漏洞作弊等不正当手段，以获取不正当利益、妨碍其他用户公平参与或违反活动目的的行为，平台有权取消该用户的参与资格及奖励领取资格，并有权追回已发放的奖励、服务或权益。

5.活动声明：平台保留根据活动实际举办情况对活动规则及奖励进行变动调整的权力，活动最终解释权归NN所有。如对活动有任何疑问或问题，可在[个人中心]-[客服反馈]中联系客服。`)

const editorTabs = [
  { id: 'base', index: '01', label: '基础信息' }, { id: 'modules', index: '02', label: '页面编排', state: '6' },
  { id: 'theme', index: '03', label: '主题素材' }, { id: 'rules', index: '04', label: '玩法配置', state: '2' },
  { id: 'description', index: '05', label: '活动说明' }, { id: 'share', index: '06', label: '分享设置' },
]
const templateCards = [
  { name: '完整互动模板', description: '适合签到、任务、抽奖、邀请综合活动', modules: 6, tone: 'violet' },
  { name: '金秋小队模板', description: '双奖池、节日任务与小队周任务', modules: 5, tone: 'orange' },
  { name: '社区盲盒模板', description: '盲盒抽奖、社区列表与任务清单', modules: 3, tone: 'blue' },
]
const availableModules = [
  { type: 'background' as ModuleType, name: '页面背景', description: 'PC/H5 头图与分段背景', icon: Picture },
  { type: 'exchange' as ModuleType, name: '积分兑换', description: '积分商城与活动奖品兑换', icon: Goods },
  { type: 'sign' as ModuleType, name: '每日签到', description: '日历签到与连续奖励', icon: Calendar },
  { type: 'task' as ModuleType, name: '任务中心', description: '任务执行器与领奖', icon: List },
  { type: 'lottery' as ModuleType, name: '福利抽奖', description: '九宫格或盲盒奖池', icon: MagicStick },
  { type: 'invite' as ModuleType, name: '邀请/小队', description: '裂变邀请与组队任务', icon: User },
  { type: 'community' as ModuleType, name: '参与社区', description: '社区列表与跳转', icon: Connection },
  { type: 'event' as ModuleType, name: '赛事卡片', description: '直播或赛事活动入口', icon: Medal },
  { type: 'rules' as ModuleType, name: '活动规则', description: '富文本规则与声明', icon: Document },
]
const metrics = [
  { label: '进行中活动', value: '4', trend: '+1 本周', hint: '2 个活动将在 7 天内结束', icon: Calendar, tone: 'blue' },
  { label: '今日参与用户', value: '12.8 万', trend: '+18.6%', hint: '较昨日同时段增长', icon: User, tone: 'violet' },
  { label: '今日奖励发放', value: '36.4 万', trend: '99.92%', hint: '成功率 · 27 笔待重试', icon: Present, tone: 'orange' },
  { label: '奖品库存预警', value: '7', trend: '需处理', hint: '3 个高价值奖品库存不足', icon: Warning, tone: 'red' },
]
const releaseRisks = [
  { title: '任务配置不完整', description: '2 个跳转任务缺少不可用提示', level: 'warning', icon: Warning },
  { title: '至臻奖池库存偏低', description: 'ROG 游戏手机仅剩 3 件', level: 'danger', icon: Box },
  { title: 'H5 素材待确认', description: '邀请模块未上传 3x 封面图', level: 'info', icon: Picture },
]
const validationChecks = ref([
  { title: '基础信息与活动时间', description: '展示、生效和领奖时间均已设置', status: 'pass', label: '通过' },
  { title: '模块依赖关系', description: '签到、抽奖、小队模块均已绑定对应玩法', status: 'pass', label: '通过' },
  { title: '任务跳转配置', description: '观赛任务和下载任务缺少跳转失败提示', status: 'warning', label: '需确认' },
  { title: '奖池概率与库存', description: '概率合计正确，但高价值奖品库存低于预警线', status: 'warning', label: '需确认' },
  { title: 'PC / H5 素材完整性', description: 'H5 邀请模块缺少 3x 分享封面', status: 'error', label: '阻断' },
  { title: '发布时段冲突', description: '未检测到同业务活动时间冲突', status: 'pass', label: '通过' },
])

const pageTitle = computed(() => pageTitleMap[activeNav.value] ?? '活动中心')
const filteredActivities = computed(() => activities.value.filter((activity) => {
  const keyword = activityKeyword.value.trim().toLowerCase()
  const matchesKeyword = !keyword || `${activity.name}${activity.id}${activity.code}`.toLowerCase().includes(keyword)
  const matchesStatus = activityStatusFilter.value === '全部' || activity.status === activityStatusFilter.value
  const matchesTemplate = templateFilter.value === '全部' || activity.template === templateFilter.value
  return matchesKeyword && matchesStatus && matchesTemplate
}))
const selectedModule = computed(() => modules.value.find((module) => module.id === selectedModuleId.value))
const enabledModules = computed(() => modules.value.filter((module) => module.enabled))
const contentModules = computed(() => enabledModules.value.filter((module) => module.type !== 'background'))
const navigableModules = computed(() => contentModules.value.filter((module) => module.type !== 'rules'))
const currentBackgroundSegments = computed(() => backgroundSegments[backgroundDevice.value])
const enabledTaskCount = computed(() => tasks.value.filter((task) => task.enabled).length)
const filteredTasks = computed(() => tasks.value.filter((task) => {
  const matchesKeyword = !taskKeyword.value || `${task.name}${task.executor}${task.id}`.includes(taskKeyword.value)
  const matchesCycle = taskCycleFilter.value === '全部' || task.cycle === taskCycleFilter.value
  return matchesKeyword && matchesCycle
}))
const validationIssues = computed(() => validationChecks.value.filter((check) => check.status !== 'pass').length)

/** 根据后端式图标名称解析实际 Vue 图标组件，未知图标使用 Grid 兜底。 */
const resolveIcon = (name: string) => iconMap[name] ?? Grid

/** 将程序内的导航动作转换为对应地址，供按钮跳转和侧栏路由保持同一导航语义。 */
const handleNavigation = (id: string) => {
  const targetPath = navigationPaths[id]
  if (targetPath) void router.push(targetPath)
}

/** 返回活动状态对应的视觉色调，供列表图标和进度卡片保持一致。 */
const statusTone = (status: ActivityStatus) => ({ '进行中': 'running', '待发布': 'pending', '草稿': 'draft', '已结束': 'ended' }[status])

/** 生成原型中的活动进度；正式版本应根据服务端时间和活动起止时间计算。 */
const activityProgress = (activity: ActivityRecord) => activity.status === '已结束' ? 100 : activity.status === '进行中' ? 62 : activity.status === '待发布' ? 12 : 4

/** 清空活动列表的关键词、状态和模板筛选条件。 */
const resetActivityFilters = () => { activityKeyword.value = ''; activityStatusFilter.value = '全部'; templateFilter.value = '全部' }

/** 打开创建活动弹窗，并重置可能残留的上一次输入。 */
const openCreateDialog = () => { newActivityForm.name = ''; newActivityForm.template = '完整互动模板'; newActivityForm.device = 'PC + H5'; createDialogVisible.value = true }

/** 创建一条本地草稿活动并自动进入页面编排，模拟真实后台创建后的工作流。 */
const createActivity = () => {
  if (!newActivityForm.name.trim()) { ElMessage.warning('请填写活动名称'); return }
  const activityId = Date.now()
  activities.value.unshift({ id: activityId, name: newActivityForm.name, code: `ACTIVITY_${activityId}`, template: newActivityForm.template, owner: '周沐', status: '草稿', device: newActivityForm.device as ActivityRecord['device'], startTime: '未设置', endTime: '未设置', updatedAt: '刚刚', modules: 0, users: '--' })
  createDialogVisible.value = false
  void router.push(`/activities/${activityId}/editor`)
  ElMessage.success('活动草稿已创建')
}

/** 将所选活动的基本信息带入编辑器，并进入页面编排页。 */
const editActivity = (activity: ActivityRecord) => {
  activityForm.name = activity.name
  activityForm.code = activity.code
  activityForm.template = activity.template
  void router.push(`/activities/${activity.id}/editor`)
}

/** 复制活动为新的草稿，避免运营从零重复配置相同玩法。 */
const duplicateActivity = (activity: ActivityRecord) => { activities.value.unshift({ ...activity, id: Date.now(), name: `${activity.name} - 副本`, code: `${activity.code}_COPY`, status: '草稿', updatedAt: '刚刚', users: '--' }); ElMessage.success('已复制为草稿') }

/** 模拟保存当前活动配置，并向用户反馈保存结果。 */
const saveDraft = () => ElMessage.success('草稿已保存，配置版本 v0.9.7')

/** 将模块库中的标准模块追加到画布；同类型模块已经存在时直接定位，避免误创建重复核心模块。 */
const addModule = (item: typeof availableModules[number]) => {
  const existing = modules.value.find((module) => module.type === item.type)
  if (existing) { openModuleConfig(existing); ElMessage.info('该模块已在页面中，已为你打开配置'); return }
  const id = `${item.type}-${Date.now()}`
  const module = { id, type: item.type, name: item.name, description: item.description, enabled: true, device: 'PC + H5' as const }
  modules.value.push(module)
  openModuleConfig(module)
}

/**
 * 打开指定模块的宽幅配置抽屉。
 * 画布只承担结构编排，复杂表单统一放入抽屉，避免配置字段挤压页面结构的可视空间。
 */
const openModuleConfig = (module: ActivityModule) => {
  selectedModuleId.value = module.id
  moduleConfigDrawer.value = true
}

/** 将用户选取的背景文件加入当前终端的素材列表，并建立可供缩略图及大图预览使用的本地临时地址。 */
const handleBackgroundUpload = (file: import('element-plus').UploadFile) => {
  if (!file.raw || !file.raw.type.startsWith('image/')) { ElMessage.warning('请选择有效的图片文件'); return }
  const previewUrl = URL.createObjectURL(file.raw)
  const sizeInKb = Math.max(1, Math.round(file.raw.size / 1024))
  currentBackgroundSegments.value.push({ name: file.name, size: `尺寸待识别 · ${sizeInKb} KB`, url: previewUrl })
}

/** 将指定背景素材放入独立预览弹窗，便于查看已上传图片的完整构图细节。 */
const previewBackgroundSegment = (segment: { name: string; url: string }) => {
  backgroundPreviewName.value = segment.name
  backgroundPreviewUrl.value = segment.url
  backgroundPreviewVisible.value = true
}

/** 在页面模块数组中上移或下移指定模块，同时保护首尾边界。 */
const moveModule = (index: number, offset: number) => { const target = index + offset; if (modules.value[index]?.type === 'background' || target <= 0 || target >= modules.value.length) return; const next = [...modules.value]; [next[index], next[target]] = [next[target], next[index]]; modules.value = next }

/** 从页面画布删除模块，并在删除当前选中项后自动选择相邻模块。 */
const removeModule = (index: number) => { if (modules.value[index]?.type === 'background') { ElMessage.warning('页面背景是必需模块，不能删除'); return }; const [removed] = modules.value.splice(index, 1); if (removed?.id === selectedModuleId.value) selectedModuleId.value = modules.value[Math.max(0, index - 1)]?.id ?? ''; ElMessage.success('模块已从页面移除') }

/** 将视觉焦点引导到左侧模块库，提示用户选择需要追加的业务模块。 */
const focusModuleLibrary = () => { ElMessage.info('请从左侧模块库选择要添加的模块') }

/** 根据模块类型跳转到对应的配置中心；第一版将任务和奖池接入真实原型页。 */
const jumpToModuleConfig = (type: ModuleType) => { moduleConfigDrawer.value = false; if (type === 'task' || type === 'sign' || type === 'invite') handleNavigation('tasks'); else if (type === 'lottery' || type === 'exchange') handleNavigation('prizes'); else ElMessage.info('该模块的详细配置将在下一版展开') }

/**
 * 保存当前模块配置并关闭抽屉。
 * 第一版使用本地响应式状态直接保存；接入服务端后应在这里提交模块配置版本并处理并发冲突。
 */
const saveModuleConfig = () => {
  moduleConfigDrawer.value = false
  ElMessage.success(`${selectedModule.value?.name ?? '模块'}配置已保存`)
}

/** 打开新建任务反馈；第一版重点呈现任务信息结构，后续可接完整表单抽屉。 */
const openTaskDialog = () => ElMessage.info('任务创建抽屉将在下一版接入执行器 Schema')

/** 打开奖品创建反馈；正式实现需要根据奖品类型切换库存和履约字段。 */
const openPrizeDialog = () => ElMessage.info('奖品创建抽屉将在下一版接入奖励资产中心')

/** 返回奖品类型对应的图标组件，让不同履约类型在表格中可快速识别。 */
const prizeIcon = (type: string) => type === '实物' ? Present : type === 'CDK' ? Tickets : type === '积分' ? Coin : type === '未中奖' ? Discount : Star

/** 返回奖品类型对应的缩略图色调类名。 */
const prizeTone = (type: string) => type === '实物' ? 'gold' : type === 'CDK' ? 'violet' : type === '未中奖' ? 'muted' : 'blue'

/** 根据库存量生成示意进度，避免无限库存奖品把进度条撑满后失去区分度。 */
const stockPercentage = (prize: typeof initialPrizes[number]) => prize.stock > 10000 ? 100 : Math.max(5, Math.min(100, Math.round(prize.stock / 5)))

/** 模拟重新执行发布校验，并保持结果由单一检查列表驱动。 */
const runValidation = () => ElMessage.success('检查完成：9 项通过，2 项警告，1 项阻断')

/** 提交当前配置进入业务审核，并明确提示仍存在阻断项。 */
const submitReview = () => { if (!releaseNote.value.trim()) { ElMessage.warning('请填写发布说明'); return }; ElMessage.warning('已提交业务审核，但 H5 素材阻断项需在发布前解决') }

/**
 * 创建轻量状态标签组件。
 * 组件以本地渲染函数实现，避免为了一个展示单元拆分额外文件，同时让活动列表和工作台共用同一状态视觉。
 */
const StatusTag = (props: { status: ActivityStatus }) => h('span', { class: ['status-tag', statusTone(props.status)] }, [h('i'), props.status])
</script>
