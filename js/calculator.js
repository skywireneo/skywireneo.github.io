/**
 * Project Calculator v3 — Fair Pricing with Enhanced UX
 *
 * Features:
 * - Step-by-step project cost estimation
 * - AI assistance toggle (20% faster, +12% cost, +15% bug risk)
 * - Full complexity coefficient (no half-discount)
 * - 30% max discount cap
 * - Additional services selection with complexity-based pricing
 * - Running total on technology step
 * - Warranty cost shown as percentage of development
 * - Keyboard accessible (Tab/Enter/Arrow keys)
 * - Auto-save to localStorage
 * - URL parameter sharing
 */
(function () {
    'use strict';

    // === CONFIGURATION CONSTANTS ===
    const CONFIG = {
        // AI assistance multipliers (Option B: medium)
        AI_TIME_MULTIPLIER: 0.80,       // 20% faster development
        AI_COST_MULTIPLIER: 1.12,       // 12% more expensive (AI licenses)
        AI_BUG_INCREASE: 15,             // 15% higher bug probability

        // Discount limits
        MAX_DISCOUNT_PERCENT: 30,        // Cap on total discounts

        // Payment plan splits
        PAYMENT_ADVANCE: 0.30,
        PAYMENT_MIDDLE: 0.40,
        PAYMENT_FINAL: 0.30,

        // Step labels
        STEP_LABELS: ['Роль', 'Проект', 'Технологии', 'Поддержка', 'Сводка']
    };

    // === STATE ===
    let D = null;

    const state = {
        currentStep: 1,
        selectedRole: null,
        selectedProject: null,
        selectedTech: new Set(),
        activeTechCategory: null,
        supportEnabled: false,
        supportPeriod: 1,
        supportHoursPerMonth: 10,
        selectedPreset: null,
        urgency: 'relaxed',
        paymentMode: 'hourly',
        additionalServices: new Set(),
        extendedWarranty: 0,
        portfolioAgreed: false,
        aiEnabled: false,
        mode: 'simple',
        clientType: 'individual' // 'individual' = физлицо (4%), 'legal' = юрлицо/ИП (6%)
    };

    const BP = window.location.pathname.includes('/skywireneo.github.io')
        ? '/skywireneo.github.io' : '';

    // ===========================
    // DATA LOADING
    // ===========================

    async function loadData() {
        try {
            const response = await fetch(`${BP}/_data/calculator.json`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            D = await response.json();
            if (!D.version || D.version < 3) {
                console.warn('Outdated calculator data version');
            }
        } catch (error) {
            console.error('Calculator: failed to load data', error);
            showError('Не удалось загрузить данные калькулятора. <button id="calcRetry" style="background:var(--accent);color:#fff;border:none;padding:.3rem .75rem;border-radius:6px;cursor:pointer;margin-left:.5rem">Попробовать снова</button>');
            return false;
        }
        return true;
    }

    function showError(message) {
        const el = document.getElementById('calcError');
        if (el) { el.innerHTML = message; el.style.display = 'block'; }
    }

    function hideError() {
        const el = document.getElementById('calcError');
        if (el) { el.style.display = 'none'; }
    }

    function showLoading() {
        const el = document.getElementById('calcLoading');
        if (el) el.style.display = 'flex';
    }

    function hideLoading() {
        const el = document.getElementById('calcLoading');
        if (el) el.style.display = 'none';
    }

    // ===========================
    // AUTO-SAVE / LOAD
    // ===========================

    function saveState() {
        try {
            localStorage.setItem('calc_state', JSON.stringify({
                r: state.selectedRole?.id, p: state.selectedProject?.id,
                t: [...state.selectedTech], sp: state.supportPeriod,
                shm: state.supportHoursPerMonth, se: state.supportEnabled,
                pr: state.selectedPreset, u: state.urgency, pm: state.paymentMode,
                as: [...state.additionalServices], ew: state.extendedWarranty,
                pa: state.portfolioAgreed, ai: state.aiEnabled, ct: state.clientType
            }));
        } catch (e) { /* ignore */ }
    }

    function loadSavedState() {
        try {
            const saved = localStorage.getItem('calc_state');
            if (!saved) return;
            const d = JSON.parse(saved);
            if (!d.r) return;
            if (!confirm('Продолжить последний расчёт?')) return;

            state.selectedRole = D.roles.find(r => r.id === d.r);
            state.selectedProject = D.projects.find(p => p.id === d.p);
            state.selectedTech = new Set(d.t || []);
            state.supportPeriod = d.sp || 1;
            state.supportHoursPerMonth = d.shm || 10;
            state.supportEnabled = d.se || false;
            state.selectedPreset = d.pr || null;
            state.urgency = d.u || 'relaxed';
            state.paymentMode = d.pm || 'hourly';
            state.additionalServices = new Set(d.as || []);
            state.extendedWarranty = d.ew || 0;
            state.portfolioAgreed = d.pa || false;
            state.aiEnabled = d.ai || false;
            state.clientType = d.ct || 'individual';
        } catch (e) { /* corrupted, ignore */ }
    }

    // ===========================
    // URL PARAMETERS
    // ===========================

    function loadFromURL() {
        try {
            const p = new URLSearchParams(window.location.search);
            if (p.get('role')) state.selectedRole = D.roles.find(r => r.id === p.get('role'));
            if (p.get('project')) state.selectedProject = D.projects.find(x => x.id === p.get('project'));
            if (p.get('tech')) p.get('tech').split(',').forEach(t => state.selectedTech.add(t));
            if (p.get('urgency')) state.urgency = p.get('urgency');
            if (p.get('pm')) state.paymentMode = p.get('pm');
            if (p.get('ai') === '1') state.aiEnabled = true;
            if (p.get('sp')) {
                state.supportEnabled = true;
                state.supportPeriod = parseInt(p.get('sp'));
                state.supportHoursPerMonth = parseInt(p.get('shm') || '10');
            }
        } catch (e) { /* ignore */ }
    }

    function generateURL() {
        const p = new URLSearchParams();
        if (state.selectedRole) p.set('role', state.selectedRole.id);
        if (state.selectedProject) p.set('project', state.selectedProject.id);
        if (state.selectedTech.size > 0) p.set('tech', [...state.selectedTech].join(','));
        if (state.urgency !== 'relaxed') p.set('urgency', state.urgency);
        if (state.paymentMode !== 'hourly') p.set('pm', state.paymentMode);
        if (state.aiEnabled) p.set('ai', '1');
        if (state.supportEnabled) { p.set('sp', state.supportPeriod); p.set('shm', state.supportHoursPerMonth); }
        return window.location.origin + window.location.pathname + '?' + p.toString();
    }

    // ===========================
    // HELPER FUNCTIONS
    // ===========================

    function getComplexity() {
        if (!state.selectedProject) return 'simple';
        const c = state.selectedTech.size;
        const t = state.selectedProject.complexityThresholds;
        if (c >= t.hard) return 'hard';
        if (c >= t.medium) return 'medium';
        return 'simple';
    }

    function getComplexityInfo(level) {
        return D.complexityCoefficients[level] || D.complexityCoefficients.simple;
    }

    function getTechCost(tech, role) {
        if (!role || !tech || !tech.baseHours) return 0;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        return Math.round(tech.baseHours * role.timeMultiplier * aiTime * role.hourlyRate * aiCost);
    }

    /** Получить базовые часы дополнительной услуги (без множителей) */
    function getServiceBaseHours(serviceId) {
        const service = D.additionalServices.find(s => s.id === serviceId);
        if (!service || !service.baseHours) return 0;
        const complexity = getComplexity();
        if (service.pricingType === 'complexity-based' && service.hoursByComplexity) {
            return service.hoursByComplexity[complexity] || service.baseHours;
        }
        return service.baseHours;
    }

    /** Рассчитать стоимость дополнительной услуги (с множителями роли и AI) */
    function getServiceCost(serviceId) {
        const baseHours = getServiceBaseHours(serviceId);
        if (!baseHours || !state.selectedRole) return 0;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        return Math.round(baseHours * state.selectedRole.timeMultiplier * aiTime * state.selectedRole.hourlyRate * aiCost);
    }

    /** Получить базовые часы проекта с учётом сложности и множителя роли */
    function getBaseHours(role) {
        // Если проект выбран и у него есть baseHours по сложности
        if (state.selectedProject && state.selectedProject.baseHours) {
            const complexity = getComplexity();
            const hours = state.selectedProject.baseHours[complexity]
                || state.selectedProject.baseHours.medium
                || state.selectedProject.baseHours.simple
                || 20;
            if (role) return Math.round(hours * role.timeMultiplier);
            return hours;
        }
        // Fallback на глобальные настройки
        if (!role) return D?.settings?.baseHours || 20;
        return Math.round(D.settings.baseHours * role.timeMultiplier);
    }

    /** Получить диапазон базовых часов проекта (для шага 2 — пока сложность неизвестна) */
    function getBaseHoursRange(project) {
        if (!project || !project.baseHours) {
            const h = D?.settings?.baseHours || 20;
            return { min: h, max: h };
        }
        const vals = Object.values(project.baseHours).filter(v => typeof v === 'number');
        if (vals.length === 0) return { min: 20, max: 20 };
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }

    function fmt(n) { if (isNaN(n) || n == null) return '0 ₽'; return new Intl.NumberFormat('ru-RU').format(Math.round(n)) + ' ₽'; }
    function fmtH(n) { if (isNaN(n) || n == null) return '0 ч'; return Math.round(n) + ' ч'; }

    function animatePrice(id, val) {
        const el = document.getElementById(id); if (!el) return;
        el.classList.add('price-changing');
        setTimeout(() => { el.textContent = fmt(val); el.classList.remove('price-changing'); el.classList.add('price-changed'); setTimeout(() => el.classList.remove('price-changed'), 500); }, 200);
    }

    // ===========================
    // CALCULATIONS
    // ===========================

    function calcDevCost() {
        const empty = { baseDevCost: 0, complexityOverhead: 0, baseWorkCost: 0, total: 0, totalHours: 0, aiSavings: 0 };
        if (!state.selectedRole || !state.selectedProject || !D?.settings) return empty;

        const complexity = getComplexity();
        const coeff = getComplexityInfo(complexity).coefficient;
        const role = state.selectedRole;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;

        let baseDevCost = 0, totalHours = 0;

        // Технологии
        state.selectedTech.forEach(id => {
            const t = D.technologies.find(x => x.id === id);
            if (!t || !t.baseHours) return;
            const h = t.baseHours * role.timeMultiplier * aiTime;
            totalHours += h; baseDevCost += h * role.hourlyRate * aiCost;
        });

        // Дополнительные услуги — считаем часы здесь, а не в getServiceCost
        state.additionalServices.forEach(id => {
            const baseHours = getServiceBaseHours(id);
            if (!baseHours) return;
            const h = baseHours * role.timeMultiplier * aiTime;
            totalHours += h; baseDevCost += h * role.hourlyRate * aiCost;
        });

        const complexityOverhead = Math.round(baseDevCost * (coeff - 1));
        const baseWorkHours = getBaseHours(role) * aiTime;
        const baseWorkCost = baseWorkHours * role.hourlyRate * aiCost;
        totalHours += baseWorkHours;
        const total = baseDevCost + complexityOverhead + baseWorkCost;

        // Рассчитываем стоимость БЕЗ AI для сравнения
        const baseDevCostNoAi = (() => {
            let cost = 0, hrs = 0;
            state.selectedTech.forEach(id => {
                const t = D.technologies.find(x => x.id === id);
                if (!t || !t.baseHours) return;
                const h = t.baseHours * role.timeMultiplier;
                hrs += h; cost += h * role.hourlyRate;
            });
            state.additionalServices.forEach(id => {
                const baseHours = getServiceBaseHours(id);
                if (!baseHours) return;
                const h = baseHours * role.timeMultiplier;
                hrs += h; cost += h * role.hourlyRate;
            });
            const overheadNoAi = cost * (coeff - 1);
            const baseNoAi = getBaseHours(role) * role.hourlyRate;
            return cost + overheadNoAi + baseNoAi;
        })();

        return {
            baseDevCost: Math.round(baseDevCost), complexityOverhead, baseWorkCost: Math.round(baseWorkCost),
            total: Math.round(total), totalHours: Math.round(totalHours),
            aiSavings: state.aiEnabled ? Math.round(baseDevCostNoAi - total) : 0
        };
    }

    function calcSupportCost() {
        if (!state.supportEnabled || !state.selectedRole) return { raw: 0, complexityDiscount: 0, longTermDiscount: 0, total: 0 };
        const complexity = getComplexity();
        const cd = D.supportDiscountsByComplexity[complexity] || 0;
        const ltd = D.settings.supportDiscounts[state.supportPeriod + 'months'] || 0;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        // AI делает поддержку быстрее, но лицензии стоят денег
        const hours = state.supportHoursPerMonth * state.supportPeriod * aiTime;
        const raw = hours * state.selectedRole.supportRate * aiCost;
        const disc = Math.min(cd + ltd, 30);
        return { raw: Math.round(raw), complexityDiscount: cd, longTermDiscount: ltd, total: Math.round(raw * (1 - disc / 100)) };
    }

    function calcWarrantyCost() {
        if (!state.extendedWarranty || !state.selectedRole) return 0;
        const option = D.extendedWarrantyOptions.find(o => o.months === state.extendedWarranty);
        if (!option) return 0;
        // Warranty is a percentage of the development cost
        const dev = calcDevCost();
        return Math.round(dev.total * option.costPercent / 100);
    }

    function calcDiscounts(devCost, supportCost) {
        const discounts = [];
        // Базовая сумма БЕЗ срочности и без фикс-наценки
        const subtotal = devCost.total + supportCost.total;

        D.discounts.forEach(discount => {
            let applicable = false, amount = 0;
            if (discount.threshold && subtotal >= discount.threshold) { applicable = true; amount = Math.round(subtotal * discount.percent / 100); }
            else if (discount.minSupportMonths && state.supportPeriod >= discount.minSupportMonths) { applicable = true; amount = Math.round(supportCost.total * discount.percent / 100); }
            else if (discount.condition === 'allRecommendedSelected' && state.selectedProject?.recommendedTech.length > 0) {
                if (state.selectedProject.recommendedTech.every(t => state.selectedTech.has(t))) { applicable = true; amount = Math.round(devCost.total * discount.percent / 100); }
            }
            else if (discount.condition === 'portfolioAgreed' && state.portfolioAgreed) { applicable = true; amount = Math.round(subtotal * discount.percent / 100); }
            if (applicable) discounts.push({ ...discount, amount });
        });

        // Не стакаем volume-скидки — оставляем только самую большую
        const vols = discounts.filter(d => d.threshold);
        if (vols.length > 1) { vols.sort((a, b) => b.amount - a.amount); vols.slice(1).forEach(r => { const i = discounts.indexOf(r); if (i >= 0) discounts.splice(i, 1); }); }

        const totalDiscount = discounts.reduce((s, d) => s + d.amount, 0);
        const maxAllowed = Math.round(subtotal * CONFIG.MAX_DISCOUNT_PERCENT / 100);
        return { discounts, totalDiscount: Math.min(totalDiscount, maxAllowed), wasCapped: totalDiscount > maxAllowed, subtotal };
    }

    function calcTotal() {
        const dev = calcDevCost();
        const sup = calcSupportCost();
        const warranty = calcWarrantyCost();

        // 1. Сначала считаем скидки от базовой суммы (без срочности и без фикс-наценки)
        const { discounts, totalDiscount, wasCapped, subtotal } = calcDiscounts(dev, sup);

        // 2. Вычитаем скидки из базовой суммы
        const afterDiscount = subtotal - totalDiscount;

        // 3. Применяем срочность к сумме после скидок
        const urgency = getUrgencyInfo();
        let withUrgency = Math.round(afterDiscount * urgency.coefficient);

        // 4. Применяем фиксированную наценку (если выбрана)
        if (state.paymentMode === 'fixed') withUrgency = Math.round(withUrgency * 1.15);

        // 5. Проверяем минимальную стоимость
        const wasBelowMin = withUrgency < D.settings.minOrderCost;
        let final = wasBelowMin ? D.settings.minOrderCost : withUrgency;

        // 6. Налог (НПД) — СВЕРХУ, оплачивается клиентом
        const taxRate = state.clientType === 'legal'
            ? (D.settings.tax?.rateLegal || 6)
            : (D.settings.tax?.rateIndividual || 4);
        const taxAmount = D.settings.tax?.enabled ? Math.round(final * taxRate / 100) : 0;
        const totalWithTax = final + taxAmount;

        return {
            dev, sup, warranty, discounts, totalDiscount, wasCapped, urgency, final,
            subtotal, afterDiscount, withUrgency: state.urgency !== 'relaxed' ? withUrgency : null,
            rawTotal: subtotal, wasBelowMin,
            tax: { enabled: D.settings.tax?.enabled || false, rate: taxRate, amount: taxAmount },
            totalWithTax
        };
    }

    function getUrgencyInfo() { return D.urgencyLevels.find(u => u.id === state.urgency) || D.urgencyLevels[0]; }

    function calcDeliveryDate() {
        const dev = calcDevCost();
        if (!dev.totalHours || dev.totalHours <= 0 || !D?.settings) return { days: 0, date: new Date(), totalHours: 0 };
        const urgency = getUrgencyInfo();
        const days = Math.ceil(dev.totalHours / D.settings.workHoursPerDay * (urgency.timePercent / 100));
        const date = new Date(); date.setDate(date.getDate() + days);
        return { days, date, totalHours: dev.totalHours };
    }

    // ===========================
    // UI RENDERING
    // ===========================

    function renderContextBar() {
        const c = document.getElementById('calcContextBar'); if (!c) return;
        const items = [];
        if (state.selectedRole) items.push(`<span><i class="${state.selectedRole.icon}"></i> ${state.selectedRole.name}</span>`);
        if (state.selectedProject) items.push(`<span><i class="${state.selectedProject.icon || 'fas fa-folder'}"></i> ${state.selectedProject.name}</span>`);
        if (state.selectedTech.size > 0) items.push(`<span><i class="fas fa-microchip"></i> ${state.selectedTech.size} техн.</span>`);
        if (state.supportEnabled) items.push(`<span><i class="fas fa-headset"></i> Поддержка</span>`);
        const completed = state.currentStep - 1;
        c.innerHTML = `<div class="calc-context-bar">${items.length ? items.join(' <span class="calc-context-sep">›</span> ') : 'Начните выбор'}</div>
            <div class="calc-progress-text">Шаг ${state.currentStep} из 5 — ${CONFIG.STEP_LABELS[state.currentStep - 1]}${completed > 0 ? ` ✅ ${completed} завершено` : ''}</div>`;
    }

    // ===========================
    // UX HELPERS
    // ===========================

    /** Show a floating price badge when user changes something */
    function showPriceBadge(amount, event) {
        const badge = document.createElement('div');
        badge.className = `calc-price-change ${amount >= 0 ? 'positive' : 'negative'}`;
        badge.textContent = `${amount >= 0 ? '+' : ''}${fmt(amount)}`;

        // Ограничиваем позицию пределами viewport
        const padding = 60;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        if (event && event.clientX) {
            const x = Math.max(padding, Math.min(event.clientX, vw - padding));
            const y = Math.max(padding, Math.min(event.clientY - 10, vh - padding));
            badge.style.left = x + 'px';
            badge.style.top = y + 'px';
        } else {
            badge.style.left = '50%';
            badge.style.top = '50%';
            badge.style.transform = 'translateX(-50%)';
        }
        document.body.appendChild(badge);
        setTimeout(() => badge.remove(), 1000);
    }

    /** Show onboarding tour for first-time visitors */
    function showOnboarding() {
        if (localStorage.getItem('calc_onboarded')) return;

        const steps = [
            { title: '💰 Добро пожаловать!', text: 'Рассчитайте стоимость проекта за 5 простых шагов. Выбирайте роль, проект, технологии — и получите точную оценку.' },
            { title: '👤 Шаг 1: Роль', text: 'Выберите кто будет делать проект. Fullstack — универсальный выбор для большинства задач.' },
            { title: '🛠️ Шаг 2: Проект', text: 'Тип проекта определяет базовый набор технологий и стоимость. Подсказки подскажут что включает каждый тип.' },
            { title: '⚙️ Шаг 3: Технологии', text: 'Обязательные уже выбраны. Добавляйте нужные — цена обновляется в реальном времени.' },
            { title: '🎉 Готово!', text: 'На последнем шаге вы получите полную сводку с графиком платежей. Можно сохранить ссылку или отправить на email.' }
        ];

        let current = 0;
        const overlay = document.createElement('div');
        overlay.className = 'calc-onboarding';

        function render() {
            const step = steps[current];
            overlay.innerHTML = `<div class="calc-onboarding-card">
                <h3>${step.title}</h3>
                <p>${step.text}</p>
                <div class="calc-onboarding-steps">${steps.map((_, i) => `<div class="calc-onboarding-dot ${i === current ? 'active' : ''}"></div>`).join('')}</div>
                <button class="calc-btn calc-btn-primary" style="width:100%">${current < steps.length - 1 ? 'Далее →' : 'Начать расчёт ✓'}</button>
                ${current > 0 ? `<button class="calc-btn calc-btn-secondary" style="width:100%;margin-top:.5rem;font-size:.8rem" id="calcOnboardingSkip">Пропустить</button>` : ''}
            </div>`;

            overlay.querySelector('.calc-btn-primary').addEventListener('click', () => {
                if (current < steps.length - 1) { current++; render(); }
                else { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); localStorage.setItem('calc_onboarded', '1'); }
            });
            overlay.querySelector('#calcOnboardingSkip')?.addEventListener('click', () => { overlay.classList.remove('active'); setTimeout(() => overlay.remove(), 300); localStorage.setItem('calc_onboarded', '1'); });
        }

        render();
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('active'), 50);
    }

    // === STEP 1: ROLES ===
    function renderRoles() {
        const c = document.getElementById('calcRoles'); if (!c || !D) return;
        c.innerHTML = D.roles.map(r => {
            const whenText = r.id === 'backend' ? 'Когда нужен бэкенд, API, базы данных' :
                r.id === 'fullstack' ? 'Когда нужен полный цикл: фронтенд + бэкенд' :
                    'Для сложных проектов с командой и архитектурой';
            return `
            <div class="calc-role-card ${state.selectedRole?.id === r.id ? 'selected' : ''}" data-role="${r.id}" role="button" tabindex="0" aria-label="Выбрать: ${r.name}" data-tooltip="${r.description}">
                <div class="calc-role-icon"><i class="${r.icon}"></i></div>
                <div class="calc-role-name">${r.name}</div>
                <div class="calc-role-desc">${r.description}</div>
                <div class="calc-role-when">${whenText}</div>
                <div class="calc-role-rates">
                    <div class="calc-role-rate" data-tooltip="Стоимость одного часа разработки"><i class="fas fa-code"></i> Разработка: <strong>${fmt(r.hourlyRate)}</strong>/ч</div>
                    <div class="calc-role-rate" data-tooltip="Стоимость одного часа поддержки"><i class="fas fa-headset"></i> Поддержка: <strong>${fmt(r.supportRate)}</strong>/ч</div>
                    <div class="calc-role-rate" data-tooltip="×${r.timeMultiplier} к времени — Fullstack чуть медленнее, Тимлид чуть быстрее"><i class="fas fa-clock"></i> Скорость: <strong>×${r.timeMultiplier}</strong></div>
                </div>
            </div>`;
        }).join('');
        c.querySelectorAll('.calc-role-card').forEach(card => {
            const sel = (e) => {
                state.selectedRole = D.roles.find(r => r.id === card.dataset.role);
                state.selectedProject = null; state.selectedTech.clear(); state.supportEnabled = false;
                state.selectedPreset = null; state.additionalServices.clear(); state.extendedWarranty = 0;
                c.querySelectorAll('.calc-role-card').forEach(x => x.classList.remove('selected')); card.classList.add('selected');
                renderContextBar(); updateNav(); goToStep(2); saveState();
            };
            card.addEventListener('click', sel);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(e); } });
        });
        renderContextBar(); updateNav();
    }

    // === STEP 2: PROJECTS ===
    function renderProjects() {
        const c = document.getElementById('calcProjects'); if (!c || !D || !state.selectedRole) return;
        const projectHints = {
            landing: 'Одностраничник: промо, визитка, лендинг продукта',
            'corporate-site': 'Многостраничный сайт компании с CMS и блогом',
            ecommerce: 'Магазин: каталог, корзина, оплата, доставка',
            crm: 'Управление клиентами: воронки, задачи, аналитика',
            'rest-api-service': 'Серверный API для мобильных приложений и внешних сервисов',
            'telegram-bot': 'Бот для автоматизации, продаж или поддержки',
            'saas-platform': 'Облачный сервис с подпиской и масштабированием',
            'admin-panel': 'Панель администратора для управления данными'
        };
        c.innerHTML = D.projects.map(p => {
            const avail = p.availableFor.includes(state.selectedRole.id);
            const hint = projectHints[p.id] || p.description;
            // Показываем диапазон базовых часов и стоимость для выбранной роли
            const pRange = getBaseHoursRange(p);
            const minH = state.selectedRole ? Math.round(pRange.min * state.selectedRole.timeMultiplier) : pRange.min;
            const maxH = state.selectedRole ? Math.round(pRange.max * state.selectedRole.timeMultiplier) : pRange.max;
            const minCost = state.selectedRole ? minH * state.selectedRole.hourlyRate : 0;
            const maxCost = state.selectedRole ? maxH * state.selectedRole.hourlyRate : 0;
            const hoursText = minH === maxH ? `${minH} ч` : `${minH}–${maxH} ч`;
            const costText = minCost === maxCost ? fmt(minCost) : `${fmt(minCost)}–${fmt(maxCost)}`;
            return `<div class="calc-project-card ${avail ? '' : 'disabled'} ${state.selectedProject?.id === p.id ? 'selected' : ''}" data-project="${p.id}" role="button" tabindex="${avail ? '0' : '-1'}" ${!avail ? 'aria-disabled="true"' : ''} data-tooltip="${hint}">
                <div class="calc-project-icon"><i class="${p.icon || 'fas fa-folder'}"></i></div>
                <div class="calc-project-name">${p.name}</div>
                <div class="calc-project-desc">${p.description}</div>
                <div class="calc-project-base-hours" data-tooltip="Базовые часы: планирование, настройка сервера, тестирование, деплой, коммуникация. Зависят от сложности проекта."><i class="fas fa-clock"></i> Базовые часы: <strong>${hoursText}</strong> (${costText})</div>
                ${!avail ? '<div class="calc-project-unavailable"><i class="fas fa-lock"></i> Недоступно</div>' : ''}
            </div>`;
        }).join('');
        c.querySelectorAll('.calc-project-card:not(.disabled)').forEach(card => {
            const sel = (e) => {
                const p = D.projects.find(x => x.id === card.dataset.project);
                state.selectedProject = p; state.selectedTech.clear();
                state.supportEnabled = p.support.required; state.supportPeriod = p.support.minPeriod;
                state.supportHoursPerMonth = p.support.minHoursPerMonth; state.selectedPreset = null;
                p.requiredTech.forEach(t => state.selectedTech.add(t));
                c.querySelectorAll('.calc-project-card').forEach(x => x.classList.remove('selected')); card.classList.add('selected');
                renderContextBar(); updateNav(); goToStep(3); saveState();
            };
            card.addEventListener('click', sel);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(e); } });
        });
        renderContextBar(); updateNav();
    }

    // === STEP 3: TECHNOLOGIES ===
    function renderTechnologies() {
        const sidebar = document.getElementById('calcTechSidebar'), main = document.getElementById('calcTechMain');
        if (!sidebar || !main || !D || !state.selectedProject) return;

        const groups = {};
        D.technologies.forEach(t => { if (state.selectedProject.availableTech.includes(t.id)) { if (!groups[t.group]) groups[t.group] = []; groups[t.group].push(t); } });
        const names = Object.keys(groups);
        if (!state.activeTechCategory || !groups[state.activeTechCategory]) state.activeTechCategory = names[0];

        // Map techId → risk text (только доступные для проекта)
        const avail = new Set(state.selectedProject.availableTech || []);
        const riskMap = {};
        (D.risks || []).forEach(r => { if (avail.has(r.tech)) riskMap[r.tech] = r.risk; });
        const recSet = new Set(state.selectedProject.recommendedTech);

        // Иконки групп
        const groupIcons = {
            'Интерфейс': '🎨', 'Серверная часть': '🖥️', 'Базы данных': '🗄️',
            'Инфраструктура': '🚀', 'Взаимодействие': '🔗', 'Пользователи': '👤',
            'Безопасность': '🔒', 'Интеграции': '💳', 'Аналитика': '📊'
        };

        sidebar.innerHTML = names.map(g => {
            const techs = groups[g];
            const sel = techs.filter(t => state.selectedTech.has(t.id)).length;
            // Check for unselected risks/recs in this group
            const groupRisks = techs.filter(t => !state.selectedTech.has(t.id) && riskMap[t.id]);
            const groupRecs = techs.filter(t => !state.selectedTech.has(t.id) && recSet.has(t.id));
            let dots = '';
            if (groupRisks.length > 0) dots += `<span class="calc-sidebar-dot calc-sidebar-dot-risk" title="${groupRisks.length} техн. с рисками не выбрано"></span>`;
            if (groupRecs.length > 0) dots += `<span class="calc-sidebar-dot calc-sidebar-dot-rec" title="${groupRecs.length} рекомендованных не выбрано"></span>`;
            return `<div class="calc-tech-sidebar-item ${state.activeTechCategory === g ? 'active' : ''}" data-group="${g}" role="button" tabindex="0"><span class="calc-tech-sidebar-name">${groupIcons[g] || ''} ${g}</span><span class="calc-tech-sidebar-count">${sel}/${techs.length}${dots ? ' ' + dots : ''}</span></div>`;
        }).join('');

        sidebar.querySelectorAll('.calc-tech-sidebar-item').forEach(item => {
            const sel = () => { state.activeTechCategory = item.dataset.group; sidebar.querySelectorAll('.calc-tech-sidebar-item').forEach(i => i.classList.remove('active')); item.classList.add('active'); renderTechMain(groups[state.activeTechCategory]); };
            item.addEventListener('click', sel);
            item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(); } });
        });

        renderTechMain(groups[state.activeTechCategory] || []);
        renderPresets();
        renderAdditionalServices();
        updateComplexityBar();
        updateRunningTotal();
        renderSmartSuggestions();
        renderRisks();
        renderContextBar();
        renderRequiredTechIndicator();
    }

    /** Индикатор обязательных технологий */
    function renderRequiredTechIndicator() {
        if (!state.selectedProject) return;
        const required = state.selectedProject.requiredTech;
        const selectedRequired = required.filter(t => state.selectedTech.has(t)).length;
        const allSelected = selectedRequired === required.length;
        // Mandatory technologies are always selected — show info
        const bar = document.getElementById('calcRequiredInfo');
        if (bar) {
            bar.innerHTML = `<div style="padding:.5rem .75rem;background:rgba(13,148,136,.1);border:1px solid rgba(13,148,136,.3);border-radius:8px;font-size:.8rem;color:var(--accent);display:flex;align-items:center;gap:.4rem;margin-bottom:.75rem">
                <i class="fas fa-lock"></i> Обязательные: ${selectedRequired}/${required} ${allSelected ? '✅' : ''}
            </div>`;
        }
    }

    function renderTechMain(techs) {
        const c = document.getElementById('calcTechMain');
        if (!c || !techs || techs.length === 0 || !state.selectedRole) { if (c) c.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:2rem">Нет доступных технологий</p>'; return; }
        const complexity = getComplexity();
        const coeff = getComplexityInfo(complexity).coefficient;
        const overheadPercent = Math.round((coeff - 1) * 100);
        const role = state.selectedRole;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;

        // Map techId → risk text (только доступные для проекта)
        const availTech = new Set(state.selectedProject.availableTech || []);
        const riskMap = {};
        (D.risks || []).forEach(r => { if (availTech.has(r.tech)) riskMap[r.tech] = r.risk; });

        c.innerHTML = techs.map(t => {
            const req = state.selectedProject.requiredTech.includes(t.id);
            const rec = state.selectedProject.recommendedTech.includes(t.id);
            const sel = state.selectedTech.has(t.id);
            const baseCost = getTechCost(t, role);
            const exactHours = t.baseHours * role.timeMultiplier * aiTime;
            const displayHours = exactHours % 1 === 0 ? exactHours : exactHours.toFixed(1);
            const adjustedCost = Math.round(baseCost * coeff);

            // Конкретный текст риска для этой технологии
            const riskText = riskMap[t.id] || null;

            // Формула скрыта по умолчанию
            const steps = [];
            steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Базовые часы:</span> ${t.baseHours}ч</span>`);
            steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Скорость:</span> ×${role.timeMultiplier} = <strong>${displayHours}ч</strong></span>`);
            if (state.aiEnabled) {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">ИИ ускорение:</span> ×0.8 = <strong>${(exactHours * CONFIG.AI_TIME_MULTIPLIER).toFixed(1)}ч</strong></span>`);
            }
            steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Ставка:</span> ×${fmt(role.hourlyRate)}/ч = <strong>${fmt(Math.round(exactHours * role.hourlyRate * aiCost))}</strong></span>`);
            if (state.aiEnabled) {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">ИИ лицензии:</span> ×1.12 = <strong>${fmt(baseCost)}</strong></span>`);
            }
            if (overheadPercent > 0) {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Сложность:</span> +${overheadPercent}% = <strong>${fmt(adjustedCost)}</strong></span>`);
            }
            const formulaHtml = `<div class="calc-tech-formula" style="display:none"><div class="calc-formula-title"><i class="fas fa-calculator"></i> Как получилась цена:</div>${steps.join('')}</div>`;

            // Рамки: красный для рисков, синий для рекомендаций
            let cardCls = 'calc-tech-card';
            if (sel) cardCls += ' selected';
            if (!sel && riskText) cardCls += ' calc-risk-border';
            else if (!sel && rec) cardCls += ' calc-rec-border';

            // Текст-причина
            let reason = '', reasonCls = '';
            if (req) { reason = 'Обязательная'; reasonCls = 'required'; }
            else if (rec && !sel) { reason = 'Рекомендуется'; reasonCls = 'recommended'; }
            else if (!sel && riskText) { reason = riskText; reasonCls = 'risk'; }

            return `<div class="${cardCls}" data-tech="${t.id}" role="button" tabindex="${req ? '-1' : '0'}" ${req ? 'aria-disabled="true"' : ''}>
                <div class="calc-tech-card-header"><div class="calc-tech-card-name"><i class="${t.icon || 'fas fa-microchip'}"></i> ${state.mode === 'detailed' ? t.name : t.plainName}</div>
                ${req ? '<span class="calc-tech-badge required">обяз.</span>' : ''}${rec && !req ? '<span class="calc-tech-badge recommended">рекоменд.</span>' : ''}
                <button class="calc-formula-toggle" data-tooltip="Показать расчёт" aria-label="Показать расчёт"><i class="fas fa-info-circle"></i></button></div>
                <div class="calc-tech-card-desc">${t.description}</div>
                ${state.mode === 'detailed' ? `<div class="calc-tech-why"><i class="fas fa-question-circle"></i> Зачем: ${t.whyNeeded}</div>` : ''}
                <div class="calc-tech-card-meta"><span><i class="fas fa-clock"></i> ${fmtH(Math.round(exactHours))}</span><span class="calc-tech-card-cost">${fmt(adjustedCost)}</span></div>
                ${formulaHtml}
                ${reason ? `<div class="calc-tech-reason ${reasonCls}"><i class="fas fa-${riskText ? 'exclamation-triangle' : 'info-circle'}"></i> ${reason}</div>` : ''}
            </div>`;
        }).join('');

        // Клик по карточке — выбор
        c.querySelectorAll('.calc-tech-card').forEach(card => {
            const id = card.dataset.tech;

            // Кнопка формулы
            const toggleBtn = card.querySelector('.calc-formula-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const f = card.querySelector('.calc-tech-formula');
                    if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
                });
            }

            if (state.selectedProject.requiredTech.includes(id)) {
                card.addEventListener('click', () => {
                    const f = card.querySelector('.calc-tech-formula');
                    if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
                });
                return;
            }
            card.addEventListener('click', (e) => {
                if (e.target.closest('.calc-tech-formula')) return;
                toggleTech(id, card, e);
            });
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleTech(id, card, e); } });
        });
    }

    function toggleTech(id, card, e) {
        const tech = D.technologies.find(t => t.id === id);
        if (!tech) return;
        const coeff = getComplexityInfo(getComplexity()).coefficient;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        const baseCost = tech.baseHours * state.selectedRole.timeMultiplier * aiTime * state.selectedRole.hourlyRate * aiCost;
        const adjustedCost = Math.round(baseCost * coeff);
        if (state.selectedTech.has(id)) {
            state.selectedTech.delete(id); card.classList.remove('selected');
            showPriceBadge(-adjustedCost, e);
        } else {
            state.selectedTech.add(id); card.classList.add('selected');
            showPriceBadge(adjustedCost, e);
        }
        renderTechnologies(); updateRunningTotal(); renderContextBar(); updateNav(); saveState();
    }

    /** Display running total (dev cost only, no support/warranty) on step 3 */
    function updateRunningTotal() {
        const el = document.getElementById('calcRunningTotal');
        if (!el || !state.selectedRole || !state.selectedProject) return;
        const dev = calcDevCost();
        const urgency = getUrgencyInfo();
        let subtotal = dev.total;
        if (state.urgency !== 'relaxed') subtotal = Math.round(subtotal * urgency.coefficient);
        if (state.paymentMode === 'fixed') subtotal = Math.round(subtotal * 1.15);

        const servicesTotal = [...state.additionalServices].reduce((s, id) => s + getServiceCost(id), 0);
        const total = subtotal + servicesTotal;

        // Разбивка по технологиям
        const techBreakdown = [...state.selectedTech].map(id => {
            const t = D.technologies.find(x => x.id === id);
            if (!t) return '';
            const exactH = t.baseHours * state.selectedRole.timeMultiplier * (state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0);
            const cost = getTechCost(t, state.selectedRole);
            const coeff = getComplexityInfo(getComplexity()).coefficient;
            const adjusted = Math.round(cost * coeff);
            return `<span class="calc-running-item"><i class="${t.icon || 'fas fa-microchip'}"></i> ${t.plainName}: <strong>${fmt(adjusted)}</strong></span>`;
        }).join('');

        // Разбивка по услугам
        const servicesBreakdown = [...state.additionalServices].map(id => {
            const s = D.additionalServices.find(x => x.id === id);
            if (!s) return '';
            return `<span class="calc-running-item">${s.icon || ''} ${s.plainName}: <strong>${fmt(getServiceCost(id))}</strong></span>`;
        }).join('');

        // Разбивка: technologies (без базовых часов)
        const techOnlyTotal = dev.baseDevCost + dev.complexityOverhead;

        el.innerHTML = `
            <div class="calc-running-total">
                <div class="calc-running-total-label">Текущая стоимость</div>
                <div class="calc-running-total-value">${fmt(total)}</div>
                <div class="calc-running-total-detail" style="flex-direction:column;gap:.2rem;margin-top:.5rem">
                    ${techBreakdown ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem .75rem">${techBreakdown}</div>` : ''}
                    ${servicesBreakdown ? `<div style="display:flex;flex-wrap:wrap;gap:.3rem .75rem;margin-top:.3rem">${servicesBreakdown}</div>` : ''}
                </div>
                <div class="calc-running-total-breakdown" style="margin-top:.5rem;font-size:.7rem;color:var(--text-muted);border-top:1px solid var(--border);padding-top:.5rem">
                    <span>Технологии: ${fmt(techOnlyTotal)}</span>
                    ${servicesTotal > 0 ? ` <span>·</span> Услуги: ${fmt(servicesTotal)}` : ''}
                    ${dev.baseWorkCost > 0 ? ` <span>·</span> Базовые ${fmtH(getBaseHours(state.selectedRole))}: ${fmt(dev.baseWorkCost)}` : ''}
                    ${dev.complexityOverhead > 0 ? ` <span>·</span> Сложность +${fmt(dev.complexityOverhead)}` : ''}
                    ${state.urgency !== 'relaxed' ? ` <span>·</span> Срочность ×${urgency.coefficient}` : ''}
                    ${state.paymentMode === 'fixed' ? ` <span>·</span> Фикс +15%` : ''}
                </div>
                <div class="calc-running-total-note">Поддержка и страховка рассчитываются на следующем шаге</div>
            </div>`;
    }

    function updateComplexityBar() {
        const bar = document.getElementById('calcComplexityBar'); if (!bar || !state.selectedProject) return;
        const c = state.selectedTech.size, t = state.selectedProject.complexityThresholds;
        const level = getComplexity(), info = getComplexityInfo(level), sd = D.supportDiscountsByComplexity[level] || 0;
        const next = level === 'simple' ? t.medium : level === 'medium' ? t.hard : null;
        const prev = level === 'hard' ? t.hard : level === 'medium' ? t.medium : 0;
        const prog = next ? Math.min(100, ((c - prev) / (next - prev)) * 100) : 100;
        bar.innerHTML = `<div class="calc-complexity-header"><div class="calc-complexity-badge ${level}"><i class="${info.icon}"></i> ${info.label}</div>
            <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap"><span class="calc-complexity-coeff">×${info.coefficient}</span>
            ${sd > 0 ? `<span style="font-size:.8rem;color:var(--accent)">Скидка поддержки: -${sd}%</span>` : ''}</div></div>
            <div class="calc-complexity-progress"><div class="calc-complexity-fill" style="width:${prog}%;background:${info.color}"></div></div>
            <div class="calc-complexity-labels"><span>${prev} техн.</span>${next ? `<span>Следующий: ${next}</span>` : '<span>Максимум</span>'}</div>`;
    }

    function renderPresets() {
        const c = document.getElementById('calcPresets');
        if (!c) return;
        if (!state.selectedProject?.presets) { c.innerHTML = ''; return; }
        const nm = { basic: 'Базовый', standard: 'Стандарт', premium: 'Премиум' };
        const ic = { basic: 'fas fa-seedling', standard: 'fas fa-star', premium: 'fas fa-crown' };
        const descs = {
            basic: 'Только необходимое — минимальная стоимость',
            standard: 'Оптимальный набор — баланс цены и качества',
            premium: 'Всё включено — максимальная функциональность'
        };
        c.innerHTML = `<div class="calc-preset-desc">Базовый = только необходимое, Стандарт = оптимально, Премиум = всё включено</div>` +
            Object.entries(state.selectedProject.presets).map(([k]) =>
                `<button class="calc-preset-btn ${state.selectedPreset === k ? 'active' : ''}" data-preset="${k}" role="button" tabindex="0" data-tooltip="${descs[k]}"><i class="${ic[k]}"></i> ${nm[k]}</button>`
            ).join('');
        c.querySelectorAll('.calc-preset-btn').forEach(btn => {
            const sel = (e) => {
                // Предупреждение если есть ручной выбор сверх обязательных
                const extra = [...state.selectedTech].filter(t => !state.selectedProject.requiredTech.includes(t));
                if (extra.length > 0 && !confirm(`Пресет «${nm[btn.dataset.preset] || btn.dataset.preset}» заменит ваш выбор (${extra.length} техн.). Продолжить?`)) return;
                state.selectedTech.clear(); state.selectedProject.requiredTech.forEach(t => state.selectedTech.add(t));
                state.selectedProject.presets[btn.dataset.preset].forEach(t => state.selectedTech.add(t));
                state.selectedPreset = btn.dataset.preset;
                c.querySelectorAll('.calc-preset-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active');
                renderTechnologies(); updateRunningTotal(); renderContextBar(); updateNav(); saveState();
            };
            btn.addEventListener('click', sel);
            btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(e); } });
        });
    }

    function renderAdditionalServices() {
        const c = document.getElementById('calcAddServices'); if (!c || !D.additionalServices) { c.innerHTML = ''; return; }
        const role = state.selectedRole;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        const complexity = getComplexity();

        c.innerHTML = `
            <div class="calc-add-services">
                <h4><i class="fas fa-concierge-bell"></i> Дополнительные услуги</h4>
                <p class="calc-add-services-desc">Что ещё включить в проект? Некоторые услуги зависят от сложности проекта.</p>
                <div class="calc-add-services-grid">
                    ${D.additionalServices.map(s => {
            const sel = state.additionalServices.has(s.id);
            const baseH = getServiceBaseHours(s.id);
            const exactH = baseH * (role ? role.timeMultiplier : 1) * aiTime;
            const cost = getServiceCost(s.id);
            const pricingText = s.pricingType === 'complexity-based' ? `Зависит от сложности: ${complexity}` : `Фиксированная цена`;

            // Формула
            const steps = [];
            if (s.pricingType === 'complexity-based') {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Сложность (${complexity}):</span> ${baseH}ч</span>`);
            } else {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Фикс:</span> ${s.baseHours}ч</span>`);
            }
            if (role) {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Скорость:</span> ×${role.timeMultiplier} = <strong>${exactH % 1 === 0 ? exactH : exactH.toFixed(1)}ч</strong></span>`);
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">Ставка:</span> ×${fmt(role.hourlyRate)}/ч = <strong>${fmt(Math.round(exactH * role.hourlyRate * aiCost))}</strong></span>`);
            }
            if (state.aiEnabled && role) {
                steps.push(`<span class="calc-formula-step"><span class="calc-formula-label">ИИ:</span> ×1.12 = <strong>${fmt(cost)}</strong></span>`);
            }
            const formulaHtml = `<div class="calc-service-formula" style="display:none"><div class="calc-formula-title"><i class="fas fa-calculator"></i> Расчёт:</div>${steps.join('')}</div>`;

            const escDesc = (s.description || '').replace(/"/g, '&quot;');
            return `<div class="calc-add-service-card ${sel ? 'selected' : ''}" data-service="${s.id}" role="checkbox" tabindex="0" aria-checked="${sel}" data-tooltip="${escDesc}">
                            <div class="calc-add-service-icon"><i class="${s.icon || 'fas fa-cog'}"></i></div>
                            <div class="calc-add-service-name">${state.mode === 'detailed' ? s.name : s.plainName}</div>
                            <div class="calc-add-service-cost">${fmt(cost)}</div>
                            <button class="calc-formula-toggle" style="position:absolute;top:6px;right:6px" data-tooltip="Расчёт" aria-label="Расчёт"><i class="fas fa-info-circle"></i></button>
                            <div class="calc-add-service-pricing">${pricingText}</div>
                            ${formulaHtml}
                        </div>`;
        }).join('')}
                </div>
            </div>`;
        c.querySelectorAll('.calc-add-service-card').forEach(card => {
            // Кнопка формулы
            const toggleBtn = card.querySelector('.calc-formula-toggle');
            if (toggleBtn) {
                toggleBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const f = card.querySelector('.calc-service-formula');
                    if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
                });
            }
            const toggle = (e) => {
                const id = card.dataset.service;
                const prevCost = state.additionalServices.has(id) ? getServiceCost(id) : 0;
                if (state.additionalServices.has(id)) { state.additionalServices.delete(id); card.classList.remove('selected'); card.setAttribute('aria-checked', 'false'); if (prevCost > 0) showPriceBadge(-prevCost, e); }
                else { state.additionalServices.add(id); card.classList.add('selected'); card.setAttribute('aria-checked', 'true'); showPriceBadge(getServiceCost(id), e); }
                renderTechnologies(); updateRunningTotal(); renderContextBar(); updateNav(); saveState();
            };
            card.addEventListener('click', toggle);
            card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(e); } });
        });
    }

    function renderSmartSuggestions() {
        const c = document.getElementById('calcSmartSuggestions'); if (!c || !D.smartSuggestions) return;
        const suggs = D.smartSuggestions[state.selectedProject.id] || [];
        const unselected = suggs.filter(s => !state.selectedTech.has(s.tech));
        if (unselected.length === 0) { c.innerHTML = ''; return; }
        c.innerHTML = `<div class="calc-smart-suggestions"><h4><i class="fas fa-lightbulb"></i> Рекомендации</h4>
            ${unselected.map(s => `<div class="calc-suggestion-item"><span class="calc-suggestion-text">${s.text}</span><button class="calc-suggestion-add" data-tech="${s.tech}"><i class="fas fa-plus"></i> Добавить</button></div>`).join('')}</div>`;
        c.querySelectorAll('.calc-suggestion-add').forEach(btn => {
            btn.addEventListener('click', () => { state.selectedTech.add(btn.dataset.tech); renderTechnologies(); updateRunningTotal(); renderContextBar(); updateNav(); saveState(); });
        });
    }

    function renderRisks() {
        const c = document.getElementById('calcRisks'); if (!c || !D.risks) return;
        const avail = new Set(state.selectedProject?.availableTech || []);
        const active = D.risks.filter(r => !state.selectedTech.has(r.tech) && avail.has(r.tech));
        if (active.length === 0) { c.innerHTML = ''; return; }
        c.innerHTML = `<div class="calc-risks"><h4><i class="fas fa-exclamation-triangle"></i> Риски — что будет без этого</h4>
            ${active.map(r => `<div class="calc-risk-item"><span><i class="${r.icon || 'fas fa-exclamation-triangle'}"></i> ${r.risk}</span><button class="calc-risk-fix-btn" data-tech="${r.tech}"><i class="fas fa-plus"></i> Исправить</button></div>`).join('')}</div>`;
        c.querySelectorAll('.calc-risk-fix-btn').forEach(btn => {
            btn.addEventListener('click', () => { state.selectedTech.add(btn.dataset.tech); renderTechnologies(); updateRunningTotal(); renderRisks(); renderContextBar(); updateNav(); saveState(); });
        });
    }

    // === STEP 4: SUPPORT & WARRANTY ===
    function renderSupport() {
        const c = document.getElementById('calcSupportSection'); if (!c || !state.selectedProject) return;
        const sp = state.selectedProject.support, level = getComplexity(), sd = D.supportDiscountsByComplexity[level] || 0;
        const warrantyOpts = D.extendedWarrantyOptions || [];
        const dev = calcDevCost();

        c.innerHTML = `
            <div class="calc-support-section">
                <div class="calc-support-block">
                    <h4><i class="fas fa-headset"></i> Техническая поддержка</h4>
                    <p class="calc-support-desc">Регулярная работа: обновления, мониторинг, мелкие доработки, консультации. Активная работа над проектом после запуска.</p>
                    <div class="calc-support-toggle"><label for="calcSupportSwitch">Нужна поддержка?</label>
                        <label class="calc-switch"><input type="checkbox" id="calcSupportSwitch" ${sp.required || state.supportEnabled ? 'checked' : ''} ${sp.required ? 'disabled' : ''}><span class="calc-switch-slider"></span></label>
                        ${sp.required ? '<span class="calc-support-required"><i class="fas fa-exclamation-circle"></i> Обязательна</span>' : ''}</div>
                    ${sd > 0 ? `<div style="margin-bottom:1rem;padding:.75rem 1rem;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:8px;font-size:.9rem;color:#22c55e;display:flex;align-items:center;gap:.5rem"><i class="fas fa-gift"></i> Скидка: <strong>-${sd}%</strong></div>` : ''}
                    <div class="calc-support-options ${state.supportEnabled || sp.required ? 'active' : ''}" id="calcSupportOptions">
                        <div class="calc-slider-group">
                            <div class="calc-slider-label"><span><i class="fas fa-calendar-alt"></i> Период</span><span class="calc-slider-value" id="calcPeriodValue">${state.supportPeriod} мес.</span></div>
                            <input type="range" class="calc-slider" id="calcPeriodSlider" min="${sp.minPeriod}" max="${sp.maxPeriod}" value="${state.supportPeriod}" data-tooltip="Чем дольше поддержка — тем дешевле за месяц. От 6 мес: скидка ${D.settings.supportDiscounts['6months'] || 10}%%">
                            <div class="calc-slider-range"><span>${sp.minPeriod} мес</span><span>${sp.maxPeriod} мес</span></div>
                        </div>
                        <div class="calc-slider-group">
                            <div class="calc-slider-label"><span><i class="fas fa-clock"></i> Часов/мес</span><span class="calc-slider-value" id="calcHoursValue">${state.supportHoursPerMonth} ч</span></div>
                            <input type="range" class="calc-slider" id="calcHoursSlider" min="${sp.minHoursPerMonth}" max="${sp.maxHoursPerMonth}" value="${state.supportHoursPerMonth}" data-tooltip="Сколько часов в месяц на поддержку? Обычно 10-20ч для небольших проектов, 30-60ч для крупных">
                            <div class="calc-slider-range"><span>${sp.minHoursPerMonth} ч</span><span>${sp.maxHoursPerMonth} ч</span></div>
                        </div>
                    </div>
                </div>
                <div class="calc-support-block">
                    <h4><i class="fas fa-shield-alt"></i> Страховка от багов</h4>
                    <p class="calc-support-desc">${D.settings.warrantyDays} дней бесплатно — исправлю любые баги после сдачи. Можно продлить: это страховка на случай скрытых ошибок. В отличие от поддержки, это только исправление багов, не новые функции.</p>
                    <p class="calc-support-desc" style="color:var(--accent);font-size:.8rem"><i class="fas fa-info-circle"></i> Стоимость рассчитывается как % от стоимости разработки (текущая: ${fmt(dev.total)})</p>
                    <div style="display:flex;gap:.5rem;flex-wrap:wrap">
                        ${warrantyOpts.map(o => `<button class="calc-warranty-btn ${state.extendedWarranty === o.months ? 'active' : ''}" data-months="${o.months}" role="button" tabindex="0">${o.label} (+${o.costPercent}% от разработки)</button>`).join('')}
                        <button class="calc-warranty-btn ${!state.extendedWarranty ? 'active' : ''}" data-months="0" role="button" tabindex="0">Не нужна</button>
                    </div>
                </div>
            </div>
            <div class="calc-support-cost" id="calcSupportCost"></div>`;

        const tog = document.getElementById('calcSupportSwitch'), ps = document.getElementById('calcPeriodSlider'), hs = document.getElementById('calcHoursSlider');
        if (tog) tog.addEventListener('change', () => { state.supportEnabled = tog.checked; document.getElementById('calcSupportOptions')?.classList.toggle('active', tog.checked); updateSupportCost(); renderContextBar(); saveState(); });
        if (ps) ps.addEventListener('input', () => { state.supportPeriod = parseInt(ps.value); const pv = document.getElementById('calcPeriodValue'); if (pv) pv.textContent = ps.value + ' мес.'; updateSupportCost(); renderContextBar(); saveState(); });
        if (hs) hs.addEventListener('input', () => { state.supportHoursPerMonth = parseInt(hs.value); const hv = document.getElementById('calcHoursValue'); if (hv) hv.textContent = hs.value + ' ч/мес'; updateSupportCost(); renderContextBar(); saveState(); });
        c.querySelectorAll('.calc-warranty-btn').forEach(btn => {
            const sel = () => { state.extendedWarranty = parseInt(btn.dataset.months); c.querySelectorAll('.calc-warranty-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); updateSupportCost(); renderContextBar(); saveState(); };
            btn.addEventListener('click', sel);
            btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); sel(); } });
        });
        updateSupportCost(); renderContextBar();
    }

    function updateSupportCost() {
        const c = document.getElementById('calcSupportCost'); if (!c) return;
        const support = calcSupportCost(), warranty = calcWarrantyCost(), dev = calcDevCost();
        const complexity = getComplexity(), info = getComplexityInfo(complexity);
        const totalDisplay = support.total + warranty;

        // Формула поддержки
        let supportFormula = '';
        if (state.supportEnabled && state.selectedRole) {
            const raw = state.supportHoursPerMonth * state.supportPeriod * state.selectedRole.supportRate;
            supportFormula = `<div class="calc-formula-step"><span class="calc-formula-label">Часов/мес:</span> ${state.supportHoursPerMonth}ч</div>`;
            supportFormula += `<div class="calc-formula-step"><span class="calc-formula-label">Период:</span> ×${state.supportPeriod} мес = ${state.supportHoursPerMonth * state.supportPeriod}ч</div>`;
            supportFormula += `<div class="calc-formula-step"><span class="calc-formula-label">Ставка поддержки:</span> ×${fmt(state.selectedRole.supportRate)}/ч = <strong>${fmt(Math.round(raw))}</strong></div>`;
            if (support.complexityDiscount > 0 || support.longTermDiscount > 0) {
                const disc = support.complexityDiscount + support.longTermDiscount;
                supportFormula += `<div class="calc-formula-step"><span class="calc-formula-label">Скидка:</span> -${disc}% = <strong style="color:#22c55e">${fmt(support.total)}</strong></div>`;
            }
        }

        // Формула страховки
        let warrantyFormula = '';
        if (warranty > 0 && dev.total > 0) {
            const pct = Math.round(warranty / dev.total * 100);
            warrantyFormula = `<div class="calc-formula-step"><span class="calc-formula-label">Страховка (${state.extendedWarranty} мес):</span> ${pct}% от ${fmt(dev.total)} = <strong>${fmt(warranty)}</strong></div>`;
        }

        let html = `<div class="calc-support-cost-label">Итого за поддержку и защиту${support.complexityDiscount > 0 ? ` <span style="color:${info.color};font-size:.8rem">(-${support.complexityDiscount}%)</span>` : ''}${support.longTermDiscount > 0 ? ` <span style="color:#22c55e;font-size:.8rem">(-${support.longTermDiscount}% долг.)</span>` : ''}</div>`;
        html += `<div class="calc-support-cost-value">${fmt(totalDisplay)}</div>`;

        // Пошаговая формула
        if (supportFormula || warrantyFormula) {
            html += `<div style="margin-top:.75rem;padding:.75rem;background:var(--bg);border:1px solid var(--border);border-radius:8px;font-size:.75rem;line-height:1.6">`;
            html += `<div class="calc-formula-title"><i class="fas fa-calculator"></i> Как получилась цена:</div>`;
            if (supportFormula) html += supportFormula;
            if (warrantyFormula) html += warrantyFormula;
            html += `</div>`;
        }

        // Детали
        html += `<div style="margin-top:.5rem;font-size:.75rem;color:var(--text-muted)">`;
        html += `<div>Поддержка: ${fmt(support.total)}</div>`;
        if (warranty > 0) html += `<div>Страховка: ${fmt(warranty)}</div>`;
        html += `</div>`;

        c.innerHTML = html; updateNav();
    }

    // === STEP 5: SUMMARY ===
    function renderSummary() {
        const c = document.getElementById('calcSummary'); if (!c) return;
        const result = calcTotal();
        const dev = result.dev, sup = result.sup, delivery = calcDeliveryDate();
        const level = getComplexity(), info = getComplexityInfo(level);
        // Calculate percentages for progress bars (before discounts)
        const totalBeforeDiscount = dev.total + (state.supportEnabled ? sup.total + result.warranty : result.warranty);
        const devPct = totalBeforeDiscount > 0 ? Math.round(dev.total / totalBeforeDiscount * 100) : 0;
        const supPct = totalBeforeDiscount > 0 && state.supportEnabled ? Math.round((sup.total + result.warranty) / totalBeforeDiscount * 100) : 0;
        const s1 = Math.round(result.final * CONFIG.PAYMENT_ADVANCE), s2 = Math.round(result.final * CONFIG.PAYMENT_MIDDLE), s3 = result.final - s1 - s2;
        const belowMin = result.rawTotal < D.settings.minOrderCost;

        // Group tech
        const byGroup = {};
        state.selectedTech.forEach(id => { const t = D.technologies.find(x => x.id === id); if (t) { if (!byGroup[t.group]) byGroup[t.group] = []; byGroup[t.group].push(t); } });

        // Additional services list
        const servicesHtml = [...state.additionalServices].map(id => {
            const s = D.additionalServices.find(x => x.id === id);
            if (!s) return '';
            const cost = getServiceCost(id);
            return `<div class="calc-summary-row"><span class="calc-summary-label">${s.icon || ''} ${state.mode === 'detailed' ? s.name : s.plainName}</span><span class="calc-summary-value">${fmt(cost)}</span></div>`;
        }).join('');

        c.innerHTML = `
            <!-- 1. Итого за работы -->
            <div class="calc-summary-total">
                <div class="calc-summary-total-label">Итого за работы</div>
                <div class="calc-summary-total-value">${fmt(result.final)}</div>
                ${result.totalDiscount > 0 ? `<div style="font-size:.8rem;color:#22c55e;margin-top:.3rem"><i class="fas fa-gift"></i> Скидка: -${fmt(result.totalDiscount)}</div>` : ''}
                ${state.urgency !== 'relaxed' ? `<div style="font-size:.75rem;color:${result.urgency.color}"><i class="fas fa-bolt"></i> ${result.urgency.label} ×${result.urgency.coefficient}</div>` : ''}
                ${state.paymentMode === 'fixed' ? `<div style="font-size:.75rem;color:var(--primary)"><i class="fas fa-lock"></i> Фикс +15%</div>` : ''}
            </div>

            <!-- 2. Настройки -->
            <div class="calc-summary-controls">
                <div class="calc-summary-ai-group">
                    <label class="calc-ai-checkbox"><input type="checkbox" id="calcAICheck" ${state.aiEnabled ? 'checked' : ''}> 🤖 ИИ на всех этапах</label>
                    <p class="calc-ai-desc">${D.settings.ai.description}</p>
                    ${state.aiEnabled && dev.aiSavings > 0 ? `<div class="calc-ai-saving" style="color:#22c55e;font-size:.75rem"><i class="fas fa-arrow-down"></i> Экономия: <strong>-${fmt(dev.aiSavings)}</strong></div>` : ''}
                </div>
                <div class="calc-summary-toggle-group"><label>Срочность:</label>
                    <select id="calcUrgencySelect" class="calc-summary-select">${D.urgencyLevels.map(u => `<option value="${u.id}" ${state.urgency === u.id ? 'selected' : ''}>${u.label} (×${u.coefficient})</option>`).join('')}</select></div>
                <div class="calc-summary-toggle-group"><label>Оплата:</label>
                    <select id="calcPaymentSelect" class="calc-summary-select">${D.paymentModes.map(m => `<option value="${m.id}" ${state.paymentMode === m.id ? 'selected' : ''}>${m.label}</option>`).join('')}</select></div>
            </div>

            <!-- 3. Налог -->
            ${result.tax.enabled ? `
            <div class="calc-summary-card calc-tax-card">
                <h4><i class="fas fa-receipt"></i> Налог</h4>
                <div class="calc-summary-row"><span class="calc-summary-label">${D.settings.tax.label}</span><span class="calc-summary-value">${result.tax.rate}%</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label">Сумма</span><span class="calc-summary-value calc-tax-amount">${fmt(result.tax.amount)}</span></div>
                <div class="calc-summary-toggle-group" style="margin-top:.5rem"><label>Тип заказчика:</label>
                    <select id="calcClientTypeSelect" class="calc-summary-select">
                        <option value="individual" ${state.clientType === 'individual' ? 'selected' : ''}>Физлицо (${D.settings.tax.rateIndividual}%)</option>
                        <option value="legal" ${state.clientType === 'legal' ? 'selected' : ''}>Юрлицо / ИП (${D.settings.tax.rateLegal}%)</option>
                    </select></div>
            </div>` : ''}

            <!-- 4. Портфолио -->
            <div class="calc-summary-controls" style="margin-top:.5rem">
                <div class="calc-summary-toggle-group"><label><input type="checkbox" id="calcPortfolioCheck" ${state.portfolioAgreed ? 'checked' : ''}> Разрешить в портфолио (−5%)</label></div>
            </div>

            <!-- 5. Инфо -->
            <div class="calc-summary-card">
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="${state.selectedRole.icon}"></i> Роль</span><span class="calc-summary-value">${state.selectedRole.name}</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="${state.selectedProject.icon || 'fas fa-folder'}"></i> Проект</span><span class="calc-summary-value">${state.selectedProject.name}</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="fas fa-chart-line"></i> Сложность</span><span class="calc-summary-value" style="color:${info.color}">${info.label}</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="fas fa-clock"></i> Базовые часы</span><span class="calc-summary-value">${fmtH(getBaseHours(state.selectedRole))}</span></div>
            </div>

            ${servicesHtml ? `<div class="calc-summary-card"><h4><i class="fas fa-concierge-bell"></i> Доп. услуги</h4>${servicesHtml}</div>` : ''}

            ${result.discounts.length > 0 ? `<div class="calc-summary-card" style="border-color:rgba(34,197,94,.3)"><h4><i class="fas fa-gift" style="color:#22c55e"></i> Скидки</h4>
                ${result.discounts.map(d => `<div class="calc-summary-row"><span class="calc-summary-label"><i class="${d.icon}"></i> ${d.label}</span><span class="calc-summary-value" style="color:#22c55e">-${fmt(d.amount)}</span></div>`).join('')}</div>` : ''}

            <!-- Распределение -->
            <div class="calc-summary-card">
                <h4><i class="fas fa-layer-group"></i> Распределение</h4>
                <div class="calc-summary-bars">
                    <div class="calc-summary-bar-item"><div class="calc-bar-header"><span>Разработка (${dev.totalHours}ч)</span><span>${fmt(dev.total)}</span></div><div class="calc-bar-track"><div class="calc-bar-fill" style="width:${devPct}%;background:var(--accent)"></div></div></div>
                    ${state.supportEnabled ? `<div class="calc-summary-bar-item"><div class="calc-bar-header"><span>Поддержка + страховка</span><span>${fmt(sup.total + result.warranty)}</span></div><div class="calc-bar-track"><div class="calc-bar-fill" style="width:${supPct}%;background:var(--primary)"></div></div></div>` : ''}
                </div>
            </div>

            <!-- График платежей -->
            <div class="calc-summary-card"><h4><i class="fas fa-credit-card"></i> График платежей</h4>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="fas fa-hand-holding-usd"></i> Аванс (30%)</span><span class="calc-summary-value">${fmt(s1)}</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="fas fa-cogs"></i> Середина (40%)</span><span class="calc-summary-value">${fmt(s2)}</span></div>
                <div class="calc-summary-row"><span class="calc-summary-label"><i class="fas fa-flag-checkered"></i> Сдача (30%)</span><span class="calc-summary-value">${fmt(s3)}</span></div></div>

            <div style="margin-top:.5rem;font-size:.8rem;color:var(--text-muted);display:flex;flex-wrap:wrap;gap:.5rem">
                <span><i class="fas fa-calendar-check"></i> ${delivery.days} раб. дней</span>
                <span><i class="fas fa-shield-alt"></i> ${D.settings.warrantyDays} дней гарантия</span>
                ${state.extendedWarranty ? `<span>+${state.extendedWarranty} мес расшир.</span>` : ''}
            </div>

            <!-- 6. К оплате -->
            <div class="calc-summary-total calc-grand-total">
                <div class="calc-grand-total-label">К оплате</div>
                <div class="calc-grand-total-value">${result.tax.enabled ? fmt(result.totalWithTax) : fmt(result.final)}</div>
                ${result.tax.enabled ? `<div class="calc-grand-breakdown">${fmt(result.final)} + ${fmt(result.tax.amount)} налог = <strong>${fmt(result.totalWithTax)}</strong></div>` : ''}
            </div>

            <div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-top:1rem">
                <button class="calc-summary-detail-btn" id="calcDetailBtn"><i class="fas fa-file-alt"></i> Подробная сводка</button>
                <button class="calc-summary-detail-btn" id="calcGlossaryBtn"><i class="fas fa-book"></i> Словарь</button>
                <button class="calc-summary-detail-btn" id="calcFaqBtn"><i class="fas fa-question-circle"></i> FAQ</button></div>
            <div style="margin-top:1rem;text-align:center">
                <button class="calc-summary-detail-btn" id="calcResetBtn" style="border-color:var(--text-muted);color:var(--text-muted)"><i class="fas fa-redo"></i> Сбросить</button></div>
            <!-- How to reduce cost -->
            <div class="calc-reduce-cost" id="calcReduceCost">
                <button class="calc-reduce-cost-toggle" id="calcReduceCostToggle"><i class="fas fa-lightbulb" style="color:#f59e0b"></i> Как уменьшить стоимость?</button>
                <div class="calc-reduce-cost-content" id="calcReduceCostContent" style="display:none">
                    <ul>
                        <li>Выберите более простой проект — лендинг (10–18ч базовых) дешевле интернет-магазина (20–38ч)</li>
                        <li>Уберите необязательные технологии — каждая технология добавляет часы работы</li>
                        <li>Выберите Backend-разработчика вместо Fullstack — ставка ниже (1500 vs 1800 ₽/ч)</li>
                        <li>Используйте пресет «Базовый» — только необходимый минимум</li>
                        <li>Откажитесь от срочности — «Спокойно» дешевле чем «Горит» на 50%</li>
                        <li>Разрешите размещение в портфолио — скидка 5%</li>
                        <li>Включите ИИ — экономия ~10% при том же качестве</li>
                        ${state.selectedTech.size > state.selectedProject.complexityThresholds.medium ? `<li>Сейчас у вас ${state.selectedTech.size} технологий (сложность: ${getComplexityInfo(getComplexity()).label}). Уберите ${state.selectedTech.size - state.selectedProject.complexityThresholds.medium} — сложность снизится, оверхед упадёт на ${Math.round((getComplexityInfo(getComplexity()).coefficient - 1) * 100)}%</li>` : ''}
                        <li>Сократите период поддержки или количество часов в месяц</li>
                    </ul>
                </div>
            </div>`;

        attachSummaryListeners();
        renderReadinessChecklist(); renderContextBar(); updateNav();
    }

    function attachSummaryListeners() {
        document.getElementById('calcDetailBtn')?.addEventListener('click', showDetailModal);
        document.getElementById('calcGlossaryBtn')?.addEventListener('click', showGlossary);
        document.getElementById('calcFaqBtn')?.addEventListener('click', showFaq);
        document.getElementById('calcResetBtn')?.addEventListener('click', resetAll);
        document.getElementById('calcAICheck')?.addEventListener('change', e => { state.aiEnabled = e.target.checked; calcTotal(); renderSummary(); updateStickyPricebar(); saveState(); });
        document.getElementById('calcPortfolioCheck')?.addEventListener('change', e => { state.portfolioAgreed = e.target.checked; calcTotal(); renderSummary(); updateStickyPricebar(); saveState(); });
        document.getElementById('calcUrgencySelect')?.addEventListener('change', e => { state.urgency = e.target.value; calcTotal(); renderSummary(); updateStickyPricebar(); saveState(); });
        document.getElementById('calcPaymentSelect')?.addEventListener('change', e => { state.paymentMode = e.target.value; calcTotal(); renderSummary(); updateStickyPricebar(); saveState(); });
        document.getElementById('calcClientTypeSelect')?.addEventListener('change', e => { state.clientType = e.target.value; calcTotal(); renderSummary(); updateStickyPricebar(); saveState(); });
        // Reduce cost toggle
        document.getElementById('calcReduceCostToggle')?.addEventListener('click', () => {
            const content = document.getElementById('calcReduceCostContent');
            if (content) content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        updateStickyPricebar();
    }

    /** Обновить sticky price bar на мобильных */
    function updateStickyPricebar() {
        const el = document.getElementById('calcStickyPriceValue');
        if (!el) return;
        if (state.currentStep >= 3 && state.selectedRole && state.selectedProject) {
            const result = calcTotal();
            el.textContent = fmt(result.tax.enabled ? result.totalWithTax : result.final);
        } else if (state.currentStep === 2 && state.selectedRole) {
            el.textContent = 'Выберите проект…';
        } else {
            el.textContent = '—';
        }
    }

    function renderReadinessChecklist() {
        const c = document.getElementById('calcReadinessChecklist'); if (!c) return;
        const servicesText = [...state.additionalServices].map(id => { const s = D.additionalServices.find(x => x.id === id); return s ? s.plainName : ''; }).filter(Boolean);
        const items = [
            { text: `Роль: ${state.selectedRole?.name || 'Не выбрана'}`, checked: !!state.selectedRole },
            { text: `Проект: ${state.selectedProject?.name || 'Не выбран'}`, checked: !!state.selectedProject },
            { text: `Технологии: ${state.selectedTech.size} выбрано`, checked: state.selectedTech.size > 0 },
            { text: `Доп. услуги: ${servicesText.length > 0 ? servicesText.join(', ') : 'Нет'}`, checked: true },
            { text: `Поддержка: ${state.supportEnabled ? state.supportPeriod + ' мес.' : 'Не нужна'}`, checked: true },
            { text: `Срочность: ${getUrgencyInfo().label}`, checked: true }
        ];
        c.innerHTML = `<div class="calc-readiness"><h4><i class="fas fa-clipboard-check"></i> Что включено в расчёт</h4>
            <div class="calc-readiness-items">${items.map(it => `<div class="calc-readiness-item ${it.checked ? 'checked' : ''}"><i class="fas ${it.checked ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${it.text}</div>`).join('')}</div></div>`;
    }

    // ===========================
    // MODALS
    // ===========================

    function showDetailModal() {
        const modal = document.getElementById('calcDetailModal'), content = document.getElementById('calcDetailContent');
        if (!modal || !content) return;
        const result = calcTotal(), delivery = calcDeliveryDate(), level = getComplexity(), info = getComplexityInfo(level), sup = calcSupportCost();
        const coeff = getComplexityInfo(level).coefficient;
        const aiTime = state.aiEnabled ? CONFIG.AI_TIME_MULTIPLIER : 1.0;
        const aiCost = state.aiEnabled ? CONFIG.AI_COST_MULTIPLIER : 1.0;
        const role = state.selectedRole;

        let techDetail = '';
        state.selectedTech.forEach(id => {
            const t = D.technologies.find(x => x.id === id); if (!t) return;
            const req = state.selectedProject.requiredTech.includes(id);
            // Показываем точные (неокруглённые) часы, чтобы формула сходилась
            const exactHours = t.baseHours * role.timeMultiplier * aiTime;
            const displayHours = exactHours % 1 === 0 ? exactHours : exactHours.toFixed(1);
            const baseCost = exactHours * role.hourlyRate * aiCost;
            const adjustedCost = Math.round(baseCost * coeff);
            techDetail += `• ${t.name}${req ? ' (обяз.)' : ''}: ${t.baseHours}ч × ${role.timeMultiplier}${state.aiEnabled ? ' × 0.8' : ''} = ${displayHours}ч × ${fmt(role.hourlyRate)}${state.aiEnabled ? ' × 1.12' : ''} = ${fmt(Math.round(baseCost))}`;
            if (coeff > 1) techDetail += ` + ${Math.round((coeff - 1) * 100)}% сложн. = ${fmt(adjustedCost)}`;
            techDetail += `\n`;
        });

        let servicesDetail = '';
        if (state.additionalServices.size > 0) {
            servicesDetail = `\nДополнительные услуги:\n`;
            state.additionalServices.forEach(id => {
                const s = D.additionalServices.find(x => x.id === id); if (!s) return;
                const baseH = getServiceBaseHours(id);
                const exactH = baseH * role.timeMultiplier * aiTime;
                const cost = getServiceCost(id);
                servicesDetail += `• ${s.name}: ${baseH}ч → ${exactH % 1 === 0 ? exactH : exactH.toFixed(1)}ч × ${fmt(role.hourlyRate)}${state.aiEnabled ? ' × 1.12' : ''} = ${fmt(cost)}\n`;
            });
        }

        // Базовые часы — корректная формула с AI
        const baseWorkH = getBaseHours(role) * aiTime;
        const baseWorkCost = baseWorkH * role.hourlyRate * aiCost;
        const baseWorkDisplayH = baseWorkH % 1 === 0 ? baseWorkH : baseWorkH.toFixed(1);

        const techLabel = state.additionalServices.size > 0 ? 'Технологии и услуги' : 'Технологии';

        content.innerHTML = `
            <div class="calc-detail-section"><div class="calc-detail-title"><i class="fas fa-user-tie"></i> Роль</div><div class="calc-detail-text">${role.name}\nРазработка: ${fmt(role.hourlyRate)}/ч\nПоддержка: ${fmt(role.supportRate)}/ч\nСкорость: ×${role.timeMultiplier}</div></div>
            <div class="calc-detail-section"><div class="calc-detail-title"><i class="fas fa-project-diagram"></i> Проект</div><div class="calc-detail-text">${state.selectedProject.name}\n${state.selectedProject.description}</div></div>
            <div class="calc-detail-section"><div class="calc-detail-title"><i class="fas fa-microchip"></i> Технологии (${state.selectedTech.size})</div><div class="calc-detail-text">Сложность: ${info.label}\n\n${techDetail}\nБазовые часы проекта «${state.selectedProject.name}»: ${state.selectedProject.baseHours[getComplexity()]}ч × ${role.timeMultiplier}${state.aiEnabled ? ' × 0.8' : ''} = ${baseWorkDisplayH}ч × ${fmt(role.hourlyRate)}${state.aiEnabled ? ' × 1.12' : ''} = ${fmt(Math.round(baseWorkCost))}${servicesDetail}</div></div>
            <div class="calc-detail-section"><div class="calc-detail-title"><i class="fas fa-calculator"></i> Расчёт</div><div class="calc-detail-text">${techLabel}: ${fmt(result.dev.baseDevCost)}
${result.dev.complexityOverhead > 0 ? `Коэффициент сложности (${info.label} ×${coeff}): +${fmt(result.dev.complexityOverhead)}
` : ''}Базовые часы (планирование, сервер, тест, деплой): ${fmt(result.dev.baseWorkCost)}
─────────────────
Разработка итого: ${fmt(result.dev.total)}${state.supportEnabled ? `

Поддержка: ${state.supportHoursPerMonth}ч/мес × ${state.supportPeriod} мес × ${fmt(state.selectedRole.supportRate)}/ч = ${fmt(sup.total)}` : ''}${state.extendedWarranty > 0 ? `
Страховка (${state.extendedWarranty} мес): ${fmt(result.warranty)}` : ''}
─────────────────
${result.discounts.length > 0 ? `Скидки: -${fmt(result.totalDiscount)}
─────────────────
После скидок: ${fmt(result.afterDiscount)}
` : ''}${state.urgency !== 'relaxed' ? `Срочность (${result.urgency.label} ×${result.urgency.coefficient}): ${fmt(result.afterDiscount)} → ${fmt(result.withUrgency)}
` : ''}${state.paymentMode === 'fixed' ? `Фиксированная цена (+15%): ${fmt(result.withUrgency ?? result.afterDiscount)} → ${fmt(result.final)}
` : ''}
═══════════════════
ИТОГО за работы: ${fmt(result.final)}${result.tax.enabled ? `
Налог (${D.settings.tax.label}, ${state.clientType === 'legal' ? 'юрлицо/ИП' : 'физлицо'} ${result.tax.rate}%): +${fmt(result.tax.amount)}
─────────────────
К оплате: ${fmt(result.totalWithTax)}` : ''}${result.wasBelowMin ? `
⚠️ Минимальный заказ: ${fmt(D.settings.minOrderCost)} (расчёт ${fmt(result.withUrgency ?? result.afterDiscount)} был ниже)` : ''}${result.wasCapped ? `
⚠️ Скидка ограничена ${CONFIG.MAX_DISCOUNT_PERCENT}%` : ''}</div></div>
            <div class="calc-detail-section"><div class="calc-detail-title"><i class="fas fa-calendar-check"></i> Сроки</div><div class="calc-detail-text">Общее время: ${delivery.totalHours} часов (${delivery.days} раб. дней)\nОжидаемая готовность: ${delivery.date.toLocaleDateString('ru-RU')}</div></div>`;
        modal.classList.add('active');
    }

    function showGlossary() {
        const modal = document.getElementById('calcGlossaryModal'), content = document.getElementById('calcGlossaryContent');
        if (!modal || !content) return;
        content.innerHTML = D.glossary.map(g => `<div class="calc-glossary-item"><strong>${g.term}</strong><p>${g.plain}</p></div>`).join('');
        modal.classList.add('active');
    }

    function showFaq() {
        const modal = document.getElementById('calcFaqModal'), content = document.getElementById('calcFaqContent');
        if (!modal || !content) return;
        const faqs = [
            { q: 'Почему Fullstack дороже Backend?', a: 'Fullstack-разработчик делает и серверную часть, и интерфейс. Это универсальный специалист, но его ставка выше, а время работы чуть больше (×1.15).' },
            { q: 'Что такое базовые часы?', a: `Базовые часы зависят от проекта: лендинг — 10–18ч, интернет-магазин — 20–38ч, SaaS — 24–46ч. Это планирование, настройка сервера, тестирование, деплой и коммуникация. Без этого проект не запустить.` },
            { q: 'Можно ли убрать обязательную технологию?', a: 'Нет. Обязательные технологии критичны для работы проекта. Например, без HTML/CSS сайта просто не будет.' },
            { q: 'Что такое фиксированная цена?', a: 'Фиксированная цена = гарантия, что вы не заплатите больше. Но +15% за риск: если проект окажется сложнее, разницу покрою я.' },
            { q: 'Как считается сложность?', a: 'Чем больше технологий — тем выше сложность. Сложные проекты требуют больше тестирования и документирования.' },
            { q: 'Что даёт использование ИИ?', a: D.settings.ai.description + ' ' + D.settings.ai.warning }
        ];
        content.innerHTML = faqs.map(f => `<details class="calc-faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`).join('');
        modal.classList.add('active');
    }

    // ===========================
    // UTILITIES
    // ===========================

    function doCopy() { const c = document.getElementById('calcDetailContent'); if (c) navigator.clipboard.writeText(c.innerText).then(() => showCopyToast()).catch(() => showCopyToast()); }
    function showCopyToast() { const t = document.createElement('div'); t.className = 'calc-copy-toast'; t.textContent = '✓ Скопировано'; document.body.appendChild(t); setTimeout(() => t.classList.add('show'), 10); setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2000); }

    function resetAll() {
        if (!confirm('Сбросить все настройки и начать заново?')) return;
        const mode = state.mode;
        Object.assign(state, { currentStep: 1, selectedRole: null, selectedProject: null, selectedTech: new Set(), activeTechCategory: null, supportEnabled: false, supportPeriod: 1, supportHoursPerMonth: 10, selectedPreset: null, urgency: 'relaxed', paymentMode: 'hourly', additionalServices: new Set(), extendedWarranty: 0, portfolioAgreed: false, aiEnabled: false, mode, clientType: 'individual' });
        localStorage.removeItem('calc_state'); goToStep(1);
    }

    // ===========================
    // NAVIGATION
    // ===========================

    function goToStep(step) {
        const prevStep = state.currentStep;
        state.currentStep = step;
        document.querySelectorAll('.calc-step-content').forEach(el => el.classList.remove('active', 'slide-in-left', 'slide-in-right'));
        const target = document.querySelector(`.calc-step-content[data-calc-step="${step}"]`);
        if (target) { const dir = step > prevStep ? 'slide-in-right' : 'slide-in-left'; target.classList.add('active', dir); }
        document.querySelectorAll('.calc-step').forEach(el => { const s = parseInt(el.dataset.step); el.classList.remove('active', 'completed'); if (s === step) el.classList.add('active'); else if (s < step) el.classList.add('completed'); });
        if (step === 1) renderRoles(); else if (step === 2) renderProjects(); else if (step === 3) renderTechnologies(); else if (step === 4) renderSupport(); else if (step === 5) renderSummary();
        updateStickyPricebar();
        saveState();
    }

    function updateNav() {
        const prev = document.getElementById('calcPrev'), next = document.getElementById('calcNext');
        if (prev) prev.disabled = state.currentStep <= 1;
        if (next) {
            let ok = false;
            if (state.currentStep === 1) ok = !!state.selectedRole;
            else if (state.currentStep === 2) ok = !!state.selectedProject;
            else if (state.currentStep === 3) ok = true;
            else if (state.currentStep === 4) ok = true;
            next.disabled = !ok;
            next.querySelector('.calc-btn-text').textContent = state.currentStep === 4 ? 'К сводке →' : state.currentStep === 5 ? 'Готово ✓' : 'Далее →';
            next.style.display = state.currentStep === 5 ? 'none' : '';
        }
        renderContextBar();
    }

    function initModeToggle() {
        document.querySelectorAll('.calc-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => { state.mode = btn.dataset.mode; document.querySelectorAll('.calc-mode-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); if (state.currentStep === 3) renderTechnologies(); });
        });
    }

    // ===========================
    // INITIALIZATION
    // ===========================

    document.addEventListener('DOMContentLoaded', () => {
        showLoading();
        loadData().then((ok) => {
            hideLoading();
            if (!ok || !D) {
                // Загрузка не удалась — кнопка повтора уже показана в calcError
                document.getElementById('calcRetry')?.addEventListener('click', () => {
                    hideError(); loadData().then((ok2) => {
                        if (ok2 && D) { hideError(); initCalculator(); }
                    });
                });
                return;
            }
            initCalculator();
        });

        function initCalculator() {
            hideError();
            loadFromURL();
            if (!state.selectedRole) loadSavedState();
            const targetStep = state.selectedRole && state.selectedProject ? 3 : state.selectedRole ? 2 : 1;
            goToStep(targetStep);
            // Show onboarding for first-time visitors
            setTimeout(() => showOnboarding(), 500);
        }

        initModeToggle();
        setTimeout(() => { document.querySelectorAll('.calc-step').forEach(step => { step.classList.add('clickable'); step.addEventListener('click', () => { const s = parseInt(step.dataset.step); if (s < state.currentStep) goToStep(s); }); }); }, 500);
        document.getElementById('calcNext')?.addEventListener('click', () => { if (state.currentStep < 5) goToStep(state.currentStep + 1); });
        document.getElementById('calcPrev')?.addEventListener('click', () => { if (state.currentStep > 1) goToStep(state.currentStep - 1); });
        document.querySelectorAll('.calc-modal-close').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.calc-modal').forEach(m => m.classList.remove('active')); }); });
        document.querySelectorAll('.calc-modal').forEach(m => { m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); }); });
        document.getElementById('calcCopyDetail')?.addEventListener('click', doCopy);
        document.getElementById('calcExportEmail')?.addEventListener('click', () => { const result = calcTotal(); const taxLine = result.tax.enabled ? `\nНалог (${D.settings.tax.label} ${result.tax.rate}%): ${fmt(result.tax.amount)}\nК оплате: ${fmt(result.totalWithTax)}` : ''; const text = `Расчёт проекта от ${new Date().toLocaleDateString('ru-RU')}\n\nПроект: ${state.selectedProject?.name}\nРоль: ${state.selectedRole?.name}\nСтоимость работ: ${fmt(result.final)}${taxLine}\nСрок: ${calcDeliveryDate().days} раб. дней\n\nПодробности: ${generateURL()}`; window.location.href = `mailto:?subject=Расчёт проекта ${state.selectedProject?.name}&body=${encodeURIComponent(text)}`; });
        document.getElementById('calcSaveLink')?.addEventListener('click', () => { const url = generateURL(); navigator.clipboard.writeText(url).then(() => showCopyToast()); window.history.replaceState(null, '', url); });
        document.getElementById('calcAutoSelect')?.addEventListener('click', () => { if (state.selectedProject?.recommendedTech) { state.selectedProject.recommendedTech.forEach(t => state.selectedTech.add(t)); renderTechnologies(); updateRunningTotal(); renderRisks(); saveState(); } });
        let sx = 0; document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
        document.addEventListener('touchend', e => { const diff = e.changedTouches[0].clientX - sx; if (Math.abs(diff) > 80) { if (diff < 0 && state.currentStep < 5) goToStep(state.currentStep + 1); else if (diff > 0 && state.currentStep > 1) goToStep(state.currentStep - 1); } }, { passive: true });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.calc-modal').forEach(m => m.classList.remove('active')); });
    });

    window.renderPresets = renderPresets;
})();
