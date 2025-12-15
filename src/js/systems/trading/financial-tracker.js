// ═══════════════════════════════════════════════════════════════
// FINANCIAL TRACKER - tracking gold flow like a dark accountant
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const FinancialTracker = {
    // Track last 4 weeks of financial data
    weeklyHistory: [],
    currentWeek: {
        income: {
            trading: 0,
            properties: 0,
            quests: 0,
            other: 0
        },
        expenses: {
            purchases: 0,
            wages: 0,
            maintenance: 0,
            repairs: 0,
            travel: 0,
            other: 0
        },
        transactions: []
    },

    // Daily tracking
    dailyHistory: [],
    currentDay: {
        income: 0,
        expenses: 0,
        transactions: []
    },

    // Running totals
    totalIncome: 0,
    totalExpenses: 0,
    startingGold: 0,

    // Initialize
    init() {
        this.startingGold = game.player?.gold || 0;
        this.setupEventListeners();
        console.log('💰 FinancialTracker initialized');
    },

    // Setup event listeners for automatic tracking
    setupEventListeners() {
        if (typeof EventBus === 'undefined') {
            console.warn('💰 FinancialTracker: EventBus not available');
            return;
        }

        // Listen for daily process to capture daily totals
        EventBus.on('time:dailyProcess', () => this.processDailyTotals());

        // Listen for weekly process to capture weekly totals
        EventBus.on('time:weeklyProcess', () => this.processWeeklyTotals());

        // Listen for gold changes (if event exists)
        EventBus.on('gold:changed', (data) => this.recordTransaction(data));
    },

    // Record a financial transaction
    recordTransaction(data) {
        const transaction = {
            amount: data.amount || 0,
            type: data.type || 'other',
            category: data.category || 'misc',
            description: data.description || 'Transaction',
            timestamp: Date.now(),
            gameDay: typeof TimeMachine !== 'undefined' ? TimeMachine.currentTime?.day : 0
        };

        if (transaction.amount > 0) {
            // Income
            this.currentDay.income += transaction.amount;
            this.totalIncome += transaction.amount;

            const incomeCategory = this._mapToIncomeCategory(transaction.category);
            this.currentWeek.income[incomeCategory] += transaction.amount;
        } else if (transaction.amount < 0) {
            // Expense (store as positive for display)
            const expense = Math.abs(transaction.amount);
            this.currentDay.expenses += expense;
            this.totalExpenses += expense;

            const expenseCategory = this._mapToExpenseCategory(transaction.category);
            this.currentWeek.expenses[expenseCategory] += expense;
        }

        this.currentDay.transactions.push(transaction);
        this.currentWeek.transactions.push(transaction);
    },

    // Manual recording methods for systems that don't emit events
    recordIncome(amount, category = 'other', description = '') {
        this.recordTransaction({
            amount: Math.abs(amount),
            type: 'income',
            category: category,
            description: description
        });
    },

    recordExpense(amount, category = 'other', description = '') {
        this.recordTransaction({
            amount: -Math.abs(amount),
            type: 'expense',
            category: category,
            description: description
        });
    },

    // Map transaction category to income category
    _mapToIncomeCategory(category) {
        const mapping = {
            'trade': 'trading', 'sell': 'trading', 'merchant': 'trading',
            'property': 'properties', 'income': 'properties', 'rent': 'properties',
            'quest': 'quests', 'reward': 'quests', 'bounty': 'quests'
        };
        return mapping[category] || 'other';
    },

    // Map transaction category to expense category
    _mapToExpenseCategory(category) {
        const mapping = {
            'buy': 'purchases', 'purchase': 'purchases', 'trade': 'purchases',
            'wage': 'wages', 'salary': 'wages', 'employee': 'wages',
            'maintenance': 'maintenance', 'upkeep': 'maintenance',
            'repair': 'repairs', 'fix': 'repairs',
            'travel': 'travel', 'transport': 'travel', 'ferry': 'travel'
        };
        return mapping[category] || 'other';
    },

    // Process end of day totals
    processDailyTotals() {
        // Save current day to history (keep last 7 days)
        this.dailyHistory.push({
            ...this.currentDay,
            day: typeof TimeMachine !== 'undefined' ? TimeMachine.currentTime?.day : 0,
            gold: game.player?.gold || 0
        });

        // Trim to last 7 days
        if (this.dailyHistory.length > 7) {
            this.dailyHistory.shift();
        }

        // Reset current day
        this.currentDay = {
            income: 0,
            expenses: 0,
            transactions: []
        };

        console.log('💰 Daily financial totals processed');
    },

    // Process end of week totals
    processWeeklyTotals() {
        // Save current week to history (keep last 4 weeks)
        this.weeklyHistory.push({
            ...this.currentWeek,
            weekNumber: this.weeklyHistory.length + 1,
            endGold: game.player?.gold || 0,
            netChange: this.getWeeklyNet()
        });

        // Trim to last 4 weeks
        if (this.weeklyHistory.length > 4) {
            this.weeklyHistory.shift();
        }

        // Reset current week
        this.currentWeek = {
            income: {
                trading: 0,
                properties: 0,
                quests: 0,
                other: 0
            },
            expenses: {
                purchases: 0,
                wages: 0,
                maintenance: 0,
                repairs: 0,
                travel: 0,
                other: 0
            },
            transactions: []
        };

        console.log('💰 Weekly financial totals processed');
    },

    // Get total income for current week
    getWeeklyIncome() {
        const income = this.currentWeek.income;
        return income.trading + income.properties + income.quests + income.other;
    },

    // Get total expenses for current week
    getWeeklyExpenses() {
        const expenses = this.currentWeek.expenses;
        return expenses.purchases + expenses.wages + expenses.maintenance +
               expenses.repairs + expenses.travel + expenses.other;
    },

    // Get net change for current week
    getWeeklyNet() {
        return this.getWeeklyIncome() - this.getWeeklyExpenses();
    },

    // Calculate estimated income/expenses from existing systems
    getProjectedWeeklyIncome() {
        let projected = 0;

        // Property income (daily * 7)
        if (typeof PropertySystem !== 'undefined') {
            const properties = PropertySystem.getProperties?.() || [];
            properties.forEach(p => {
                projected += (p.income || 0) * 7;
            });
        }

        // Trade route income
        if (typeof TradeRouteSystem !== 'undefined') {
            const routes = TradeRouteSystem.getTradeRoutes?.() || [];
            routes.forEach(r => {
                projected += (r.estimatedProfit || 0) * 7;
            });
        }

        return projected;
    },

    // Calculate projected weekly expenses
    getProjectedWeeklyExpenses() {
        let projected = 0;

        // Employee wages
        if (typeof EmployeeSystem !== 'undefined') {
            const employees = EmployeeSystem.getEmployees?.() || [];
            employees.forEach(e => {
                projected += e.wage || 0;
            });
        }

        // Property maintenance (daily * 7)
        if (typeof PropertySystem !== 'undefined') {
            const properties = PropertySystem.getProperties?.() || [];
            properties.forEach(p => {
                const type = typeof PropertyTypes !== 'undefined' ? PropertyTypes.get?.(p.type) : null;
                projected += ((type?.maintenanceCost || 0) * 7);
            });
        }

        return projected;
    },

    // Get summary data for display
    getSummary() {
        const currentGold = game.player?.gold || 0;
        const weeklyIncome = this.getWeeklyIncome();
        const weeklyExpenses = this.getWeeklyExpenses();
        const projectedIncome = this.getProjectedWeeklyIncome();
        const projectedExpenses = this.getProjectedWeeklyExpenses();

        return {
            currentGold,
            weeklyIncome,
            weeklyExpenses,
            weeklyNet: weeklyIncome - weeklyExpenses,
            projectedIncome,
            projectedExpenses,
            projectedNet: projectedIncome - projectedExpenses,
            totalIncome: this.totalIncome,
            totalExpenses: this.totalExpenses,
            lifetimeNet: this.totalIncome - this.totalExpenses,
            startingGold: this.startingGold,
            goldChange: currentGold - this.startingGold,
            incomeBreakdown: { ...this.currentWeek.income },
            expenseBreakdown: { ...this.currentWeek.expenses },
            dailyHistory: [...this.dailyHistory],
            weeklyHistory: [...this.weeklyHistory]
        };
    },

    // Get save data
    getSaveData() {
        return {
            weeklyHistory: this.weeklyHistory,
            currentWeek: this.currentWeek,
            dailyHistory: this.dailyHistory,
            currentDay: this.currentDay,
            totalIncome: this.totalIncome,
            totalExpenses: this.totalExpenses,
            startingGold: this.startingGold
        };
    },

    // Load save data
    loadSaveData(data) {
        if (!data) return;

        this.weeklyHistory = data.weeklyHistory || [];
        this.currentWeek = data.currentWeek || this.currentWeek;
        this.dailyHistory = data.dailyHistory || [];
        this.currentDay = data.currentDay || this.currentDay;
        this.totalIncome = data.totalIncome || 0;
        this.totalExpenses = data.totalExpenses || 0;
        this.startingGold = data.startingGold || game.player?.gold || 0;
    }
};

// Expose to global scope
window.FinancialTracker = FinancialTracker;
