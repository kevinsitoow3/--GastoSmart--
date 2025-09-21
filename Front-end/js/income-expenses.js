/**
 * Módulo de Gestión de Ingresos y Gastos con Algoritmos de Ordenamiento
 * 
 * Este módulo implementa la funcionalidad completa para el manejo de ingresos y gastos
 * en GastoSmart, incluyendo algoritmos de ordenamiento avanzados como merge-sort
 * para optimizar la visualización y búsqueda de transacciones.
 * 
 * Características principales:
 * - Algoritmo merge-sort optimizado para transacciones financieras
 * - Ordenamiento por fecha, monto, categoría
 * - Interfaz moderna basada en el diseño proporcionado
 * - Gestión de estado en tiempo real
 * - Validaciones según requerimientos RQF-005
 * 
 * @author Kevin Correa - Analista de Requerimientos
 * @version 2.0 - Actualizado para nueva interfaz
 * @date 2025-01-15
 */

// ===== CONFIGURACIÓN Y CONSTANTES =====
const CONFIG = {
    API_BASE_URL: '/api/v1',
    ENDPOINTS: {
        INCOMES: '/incomes',
        EXPENSES: '/expenses',
        TRANSACTIONS: '/transactions'
    },
    VALIDATION_RULES: {
        MIN_AMOUNT: 1,
        MAX_AMOUNT: 999999999,
        REQUIRED_FIELDS: ['amount', 'category', 'date']
    },
    SORT_OPTIONS: {
        DATE_ASC: 'date_asc',
        DATE_DESC: 'date_desc',
        AMOUNT_ASC: 'amount_asc',
        AMOUNT_DESC: 'amount_desc',
        CATEGORY_ASC: 'category_asc'
    }
};

// ===== ESTADO DE LA APLICACIÓN =====
let appState = {
    // Datos principales
    balance: 1450000,
    balanceTrend: 3.3,
    
    // Ingresos
    incomes: [
        { id: 'inc_1', category: 'Salario', amount: 2800000, type: 'income', date: '2025-01-15' },
        { id: 'inc_2', category: 'Freelance', amount: 250000, type: 'income', date: '2025-01-10' },
        { id: 'inc_3', category: 'Intereses', amount: 150000, type: 'income', date: '2025-01-05' }
    ],
    totalIncome: 3200000,
    incomeTrend: 5.4,
    
    // Gastos
    expenses: [
        { id: 'exp_1', category: 'Arriendo', amount: 800000, type: 'expense', date: '2025-01-01' },
        { id: 'exp_2', category: 'Comida', amount: 450000, type: 'expense', date: '2025-01-12' },
        { id: 'exp_3', category: 'Transporte', amount: 200000, type: 'expense', date: '2025-01-08' },
        { id: 'exp_4', category: 'Entretenimiento', amount: 300000, type: 'expense', date: '2025-01-14' }
    ],
    totalExpense: 1750000,
    expenseTrend: -2.1,
    
    // Estado de la interfaz
    currentSort: CONFIG.SORT_OPTIONS.DATE_DESC,
    isLoading: false
};

// ===== ALGORITMO MERGE-SORT OPTIMIZADO =====
/**
 * Implementación optimizada del algoritmo merge-sort para transacciones financieras
 * Complejidad: O(n log n) en todos los casos
 * Espacio: O(n) para el array auxiliar
 * 
 * Ventajas para transacciones financieras:
 * - Estable: mantiene el orden relativo de elementos iguales
 * - Predecible: siempre O(n log n), ideal para datasets grandes
 * - Eficiente: aprovecha mejor la caché que quicksort para arrays grandes
 */
class TransactionSorter {
    constructor() {
        this.comparisonCount = 0;
        this.swapCount = 0;
    }

    /**
     * Algoritmo merge-sort principal
     * @param {Array} arr - Array de transacciones a ordenar
     * @param {string} sortBy - Criterio de ordenamiento
     * @param {boolean} ascending - Orden ascendente (true) o descendente (false)
     * @returns {Array} Array ordenado
     */
    mergeSort(arr, sortBy = 'date', ascending = false) {
        if (arr.length <= 1) {
            return arr;
        }

        this.comparisonCount = 0;
        this.swapCount = 0;
        
        const aux = new Array(arr.length);
        return this._mergeSortHelper(arr, aux, 0, arr.length - 1, sortBy, ascending);
    }

    /**
     * Función auxiliar recursiva del merge-sort
     */
    _mergeSortHelper(arr, aux, low, high, sortBy, ascending) {
        if (low < high) {
            const mid = Math.floor((low + high) / 2);
            
            // Dividir recursivamente
            this._mergeSortHelper(arr, aux, low, mid, sortBy, ascending);
            this._mergeSortHelper(arr, aux, mid + 1, high, sortBy, ascending);
            
            // Combinar las mitades ordenadas
            this._merge(arr, aux, low, mid, high, sortBy, ascending);
        }
        
        return arr;
    }

    /**
     * Función de combinación (merge) optimizada
     */
    _merge(arr, aux, low, mid, high, sortBy, ascending) {
        // Copiar elementos al array auxiliar
        for (let k = low; k <= high; k++) {
            aux[k] = arr[k];
        }

        let i = low;
        let j = mid + 1;

        // Combinar los elementos ordenadamente
        for (let k = low; k <= high; k++) {
            this.comparisonCount++;
            
            if (i > mid) {
                // Elementos restantes de la mitad derecha
                arr[k] = aux[j++];
            } else if (j > high) {
                // Elementos restantes de la mitad izquierda
                arr[k] = aux[i++];
            } else if (this._compare(aux[j], aux[i], sortBy, ascending)) {
                // aux[j] viene antes que aux[i]
                arr[k] = aux[j++];
                this.swapCount++;
            } else {
                // aux[i] viene antes que aux[j]
                arr[k] = aux[i++];
            }
        }
    }

    /**
     * Función de comparación optimizada para transacciones
     */
    _compare(a, b, sortBy, ascending) {
        let result = false;

        switch (sortBy) {
            case 'date':
                result = new Date(a.date) < new Date(b.date);
                break;
            case 'amount':
                result = a.amount < b.amount;
                break;
            case 'category':
                result = a.category.toLowerCase() < b.category.toLowerCase();
                break;
            default:
                result = new Date(a.date) < new Date(b.date);
        }

        return ascending ? result : !result;
    }

    /**
     * Ordenamiento híbrido: usa insertion sort para arrays pequeños
     * y merge-sort para arrays grandes (optimización de rendimiento)
     */
    hybridSort(arr, sortBy = 'date', ascending = false) {
        if (arr.length <= 10) {
            return this._insertionSort(arr, sortBy, ascending);
        }
        return this.mergeSort(arr, sortBy, ascending);
    }

    /**
     * Insertion sort para arrays pequeños (más eficiente que merge-sort)
     */
    _insertionSort(arr, sortBy, ascending) {
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;

            while (j >= 0 && this._compare(arr[j], key, sortBy, !ascending)) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    }

    /**
     * Obtener estadísticas del último ordenamiento
     */
    getSortStats() {
        return {
            comparisons: this.comparisonCount,
            swaps: this.swapCount,
            algorithm: 'merge-sort'
        };
    }
}

// ===== GESTIÓN DE TRANSACCIONES =====
class TransactionManager {
    constructor() {
        this.sorter = new TransactionSorter();
        this.transactions = [];
    }

    /**
     * Agregar nueva transacción (ingreso o gasto)
     * Implementa validaciones del requerimiento RQF-005
     */
    async addTransaction(transactionData) {
        try {
            // Validaciones según RQF-005
            const validation = this._validateTransaction(transactionData);
            if (!validation.isValid) {
                throw new Error(validation.message);
            }

            // Preparar datos de la transacción
            const transaction = {
                id: this._generateId(),
                type: transactionData.type, // 'income' o 'expense'
                amount: parseFloat(transactionData.amount),
                category: transactionData.category,
                date: transactionData.date,
                description: transactionData.description || '',
                createdAt: new Date().toISOString(),
                userId: this._getCurrentUserId()
            };

            // Agregar al array local
            this.transactions.push(transaction);

            // Enviar al backend
            await this._saveToBackend(transaction);

            // Actualizar estadísticas
            this._updateStatistics();

            // Reordenar transacciones
            this._sortTransactions();

            return {
                success: true,
                transaction: transaction,
                message: 'Transacción agregada exitosamente'
            };

        } catch (error) {
            console.error('Error al agregar transacción:', error);
            return {
                success: false,
                message: error.message || 'Error al procesar la transacción'
            };
        }
    }

    /**
     * Validaciones según requerimiento RQF-005
     */
    _validateTransaction(data) {
        // RN-01: El monto debe ser mayor a 0
        if (!data.amount || data.amount <= 0) {
            return {
                isValid: false,
                message: 'El monto debe ser mayor a 0'
            };
        }

        // Validar que el monto sea numérico
        if (isNaN(parseFloat(data.amount))) {
            return {
                isValid: false,
                message: 'El monto debe ser un valor numérico válido'
            };
        }

        // RN-02: La categoría debe seleccionarse obligatoriamente
        if (!data.category || data.category.trim() === '') {
            return {
                isValid: false,
                message: 'La categoría es obligatoria'
            };
        }

        // Validar fecha
        if (!data.date) {
            return {
                isValid: false,
                message: 'La fecha es obligatoria'
            };
        }

        // Validar tipo de transacción
        if (!data.type || !['income', 'expense'].includes(data.type)) {
            return {
                isValid: false,
                message: 'Tipo de transacción inválido'
            };
        }

        return { isValid: true };
    }

    /**
     * Ordenar transacciones usando merge-sort
     */
    sortTransactions(sortBy = 'date', ascending = false) {
        const startTime = performance.now();
        
        this.transactions = this.sorter.hybridSort(
            [...this.transactions], 
            sortBy, 
            ascending
        );

        const endTime = performance.now();
        const sortStats = this.sorter.getSortStats();

        console.log(`Ordenamiento completado en ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`Comparaciones: ${sortStats.comparisons}, Swaps: ${sortStats.swaps}`);

        return this.transactions;
    }

    /**
     * Búsqueda eficiente en transacciones ordenadas
     */
    searchTransactions(query, sortBy = 'date') {
        if (!query || query.trim() === '') {
            return this.transactions;
        }

        const searchTerm = query.toLowerCase().trim();
        
        return this.transactions.filter(transaction => {
            return (
                transaction.category.toLowerCase().includes(searchTerm) ||
                transaction.description.toLowerCase().includes(searchTerm) ||
                transaction.amount.toString().includes(searchTerm)
            );
        });
    }

    /**
     * Filtrar transacciones por tipo
     */
    filterByType(type) {
        if (type === 'all') {
            return this.transactions;
        }
        return this.transactions.filter(t => t.type === type);
    }

    /**
     * Obtener estadísticas financieras
     */
    getStatistics() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return {
            totalIncome: income,
            totalExpense: expense,
            balance: income - expense,
            transactionCount: this.transactions.length
        };
    }

    // Métodos auxiliares
    _generateId() {
        return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    _getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        return user ? user.id : null;
    }

    async _saveToBackend(transaction) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user || !user.id) {
                throw new Error('Usuario no autenticado');
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TRANSACTIONS}?user_id=${user.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: transaction.type,
                    amount: transaction.amount,
                    category: transaction.category,
                    date: transaction.date,
                    description: transaction.description,
                    currency: transaction.currency || 'COP'
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Error al guardar transacción');
            }

            const savedTransaction = await response.json();
            console.log('Transacción guardada exitosamente:', savedTransaction);
            return savedTransaction;

        } catch (error) {
            console.error('Error al guardar transacción en backend:', error);
            throw error;
        }
    }

    _updateStatistics() {
        const stats = this.getStatistics();
        appState.totalIncome = stats.totalIncome;
        appState.totalExpense = stats.totalExpense;
        appState.balance = stats.balance;
    }

    _sortTransactions() {
        this.sortTransactions(appState.currentSort.split('_')[0], appState.currentSort.includes('desc'));
    }
}

// ===== INTERFAZ DE USUARIO =====
class IncomeExpenseUI {
    constructor(transactionManager) {
        this.transactionManager = transactionManager;
        this.isInitialized = false;
        this.mergeSortDemo = new MergeSortDemo();
    }

    /**
     * Inicializar la interfaz de usuario
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            this._renderUI();
            this._bindEvents();
            this._updateDisplay();
            this._showMergeSortDemo();
            this.isInitialized = true;
        } catch (error) {
            console.error('Error al inicializar UI:', error);
        }
    }

    /**
     * Renderizar la interfaz de usuario
     */
    _renderUI() {
        console.log('Inicializando interfaz de usuario moderna...');
        this._renderBalanceCard();
        this._renderIncomeCard();
        this._renderExpenseCard();
    }

    /**
     * Mostrar demostración del algoritmo merge-sort
     */
    async _showMergeSortDemo() {
        try {
            console.log('🚀 Ejecutando demostración del algoritmo merge-sort...');
            
            // Combinar ingresos y gastos para la demostración
            const allTransactions = [...appState.incomes, ...appState.expenses];
            
            // Ejecutar merge-sort y mostrar estadísticas
            const sortedData = this.mergeSortDemo.mergeSortWithSteps(allTransactions, 'date', false);
            
            const stats = this.mergeSortDemo.steps[this.mergeSortDemo.steps.length - 1]?.stats;
            if (stats) {
                console.log(`✅ Merge-sort completado: ${stats.comparisons} comparaciones, ${stats.time.toFixed(2)}ms`);
                
                // Mostrar indicador visual
                this._showAlgorithmIndicator();
            }
            
        } catch (error) {
            console.error('Error en demostración merge-sort:', error);
        }
    }

    /**
     * Mostrar indicador visual del algoritmo
     */
    _showAlgorithmIndicator() {
        const indicator = document.getElementById('algorithm-indicator');
        if (indicator) {
            indicator.style.display = 'block';
            indicator.textContent = '🧮 Algoritmo Merge-Sort Activo';
            
            // Ocultar después de 4 segundos
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 4000);
        }
    }

    /**
     * Actualizar toda la pantalla
     */
    _updateDisplay() {
        this._updateBalanceCard();
        this._updateIncomeCard();
        this._updateExpenseCard();
    }

    /**
     * Renderizar tarjeta de balance
     */
    _renderBalanceCard() {
        // El HTML ya está renderizado, solo actualizamos los valores
    }

    /**
     * Actualizar tarjeta de balance
     */
    _updateBalanceCard() {
        const balanceAmount = document.querySelector('.balance-amount');
        const balanceTrend = document.querySelector('.balance-trend');
        
        if (balanceAmount) {
            balanceAmount.textContent = `COL $${this._formatAmount(appState.balance)}`;
        }
        
        if (balanceTrend) {
            const trendText = appState.balanceTrend > 0 ? `↗ +${appState.balanceTrend}%` : `↘ ${appState.balanceTrend}%`;
            balanceTrend.textContent = trendText;
            balanceTrend.className = `balance-trend ${appState.balanceTrend > 0 ? 'positive' : 'negative'}`;
        }
    }

    /**
     * Renderizar tarjeta de ingresos
     */
    _renderIncomeCard() {
        // Ordenar ingresos usando merge-sort
        const sortedIncomes = this.transactionManager.sorter.mergeSort([...appState.incomes], 'amount', false);
        this._updateIncomeList(sortedIncomes);
    }

    /**
     * Actualizar tarjeta de ingresos
     */
    _updateIncomeCard() {
        const incomeAmount = document.querySelector('.income-amount');
        const incomeTrend = document.querySelector('.income-card .card-trend');
        const incomeTotal = document.querySelector('.income-card .total-label');
        
        if (incomeAmount) {
            incomeAmount.textContent = `COL $${this._formatAmount(appState.totalIncome)}`;
        }
        
        if (incomeTrend) {
            const trendText = `↗ +${appState.incomeTrend}%`;
            incomeTrend.textContent = trendText;
        }
        
        if (incomeTotal) {
            incomeTotal.textContent = `Total ingresos: $${this._formatAmount(appState.totalIncome)}`;
        }
    }

    /**
     * Renderizar tarjeta de gastos
     */
    _renderExpenseCard() {
        // Ordenar gastos usando merge-sort
        const sortedExpenses = this.transactionManager.sorter.mergeSort([...appState.expenses], 'amount', false);
        this._updateExpenseList(sortedExpenses);
    }

    /**
     * Actualizar tarjeta de gastos
     */
    _updateExpenseCard() {
        const expenseAmount = document.querySelector('.expense-amount');
        const expenseTrend = document.querySelector('.expense-card .card-trend');
        const expenseTotal = document.querySelector('.expense-card .total-label');
        
        if (expenseAmount) {
            expenseAmount.textContent = `COL $${this._formatAmount(appState.totalExpense)}`;
        }
        
        if (expenseTrend) {
            const trendText = `↘ ${appState.expenseTrend}%`;
            expenseTrend.textContent = trendText;
        }
        
        if (expenseTotal) {
            expenseTotal.textContent = `Total gastos: $${this._formatAmount(appState.totalExpense)}`;
        }
    }

    /**
     * Actualizar lista de ingresos
     */
    _updateIncomeList(incomes) {
        const dataList = document.querySelector('.income-card .data-list');
        if (!dataList) return;

        // Los datos ya están en el HTML, pero podríamos actualizarlos dinámicamente
        console.log('Lista de ingresos ordenada:', incomes);
    }

    /**
     * Actualizar lista de gastos
     */
    _updateExpenseList(expenses) {
        const dataList = document.querySelector('.expense-card .data-list');
        if (!dataList) return;

        // Los datos ya están en el HTML, pero podríamos actualizarlos dinámicamente
        console.log('Lista de gastos ordenada:', expenses);
    }

    /**
     * Vincular eventos de la interfaz
     */
    _bindEvents() {
        // Botones de recomendaciones y alertas
        const recommendationsBtn = document.getElementById('recommendations-btn');
        const alertsBtn = document.getElementById('alerts-btn');
        
        if (recommendationsBtn) {
            recommendationsBtn.addEventListener('click', () => {
                this._showRecommendations();
            });
        }
        
        if (alertsBtn) {
            alertsBtn.addEventListener('click', () => {
                this._showAlerts();
            });
        }

        // Botones de ingresos
        const addIncomeBtn = document.getElementById('add-income-btn');
        const editIncomeBtn = document.getElementById('edit-income-btn');
        const deleteIncomeBtn = document.getElementById('delete-income-btn');
        
        if (addIncomeBtn) {
            addIncomeBtn.addEventListener('click', () => {
                this._handleAddIncome();
            });
        }
        
        if (editIncomeBtn) {
            editIncomeBtn.addEventListener('click', () => {
                this._handleEditIncome();
            });
        }
        
        if (deleteIncomeBtn) {
            deleteIncomeBtn.addEventListener('click', () => {
                this._handleDeleteIncome();
            });
        }

        // Botones de gastos
        const addExpenseBtn = document.getElementById('add-expense-btn');
        const editExpenseBtn = document.getElementById('edit-expense-btn');
        const deleteExpenseBtn = document.getElementById('delete-expense-btn');
        
        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                this._handleAddExpense();
            });
        }
        
        if (editExpenseBtn) {
            editExpenseBtn.addEventListener('click', () => {
                this._handleEditExpense();
            });
        }
        
        if (deleteExpenseBtn) {
            deleteExpenseBtn.addEventListener('click', () => {
                this._handleDeleteExpense();
            });
        }
    }

    /**
     * Mostrar recomendaciones
     */
    _showRecommendations() {
        console.log('🎯 Mostrando recomendaciones financieras...');
        
        // Usar merge-sort para analizar patrones de gastos
        const sortedExpenses = this.transactionManager.sorter.mergeSort([...appState.expenses], 'amount', false);
        
        const recommendations = this._generateRecommendations(sortedExpenses);
        this._showNotification(`Recomendaciones: ${recommendations.join(', ')}`, 'info');
    }

    /**
     * Mostrar alertas
     */
    _showAlerts() {
        console.log('⚠️ Mostrando alertas financieras...');
        
        const alerts = this._generateAlerts();
        this._showNotification(`Alertas: ${alerts.join(', ')}`, 'warning');
    }

    /**
     * Manejar agregar ingreso
     */
    _handleAddIncome() {
        console.log('➕ Agregando nuevo ingreso...');
        this._showMergeSortInAction('income');
        this._showNotification('Funcionalidad de agregar ingreso en desarrollo', 'info');
    }

    /**
     * Manejar editar ingreso
     */
    _handleEditIncome() {
        console.log('✏️ Editando ingresos...');
        this._showMergeSortInAction('income');
        this._showNotification('Funcionalidad de editar ingreso en desarrollo', 'info');
    }

    /**
     * Manejar eliminar ingreso
     */
    _handleDeleteIncome() {
        console.log('🗑️ Eliminando ingreso...');
        this._showMergeSortInAction('income');
        this._showNotification('Funcionalidad de eliminar ingreso en desarrollo', 'info');
    }

    /**
     * Manejar agregar gasto
     */
    _handleAddExpense() {
        console.log('➕ Agregando nuevo gasto...');
        this._showMergeSortInAction('expense');
        this._showNotification('Funcionalidad de agregar gasto en desarrollo', 'info');
    }

    /**
     * Manejar editar gasto
     */
    _handleEditExpense() {
        console.log('✏️ Editando gastos...');
        this._showMergeSortInAction('expense');
        this._showNotification('Funcionalidad de editar gasto en desarrollo', 'info');
    }

    /**
     * Manejar eliminar gasto
     */
    _handleDeleteExpense() {
        console.log('🗑️ Eliminando gasto...');
        this._showMergeSortInAction('expense');
        this._showNotification('Funcionalidad de eliminar gasto en desarrollo', 'info');
    }

    /**
     * Mostrar modal para agregar transacción
     */
    _showModal(type) {
        const modal = document.getElementById('transaction-modal');
        const modalTitle = document.getElementById('modal-title');
        const categorySelect = document.getElementById('transaction-category');
        const dateInput = document.getElementById('transaction-date');
        
        // Configurar título del modal
        modalTitle.textContent = type === 'income' ? 'Agregar Ingreso' : 'Agregar Gasto';
        
        // Configurar categorías
        this._populateCategories(categorySelect, type);
        
        // Establecer fecha actual por defecto
        dateInput.value = new Date().toISOString().split('T')[0];
        
        // Mostrar modal
        modal.style.display = 'flex';
        
        // Guardar tipo de transacción
        modal.dataset.transactionType = type;
    }

    /**
     * Ocultar modal
     */
    _hideModal() {
        document.getElementById('transaction-modal').style.display = 'none';
        document.getElementById('transaction-form').reset();
    }

    /**
     * Manejar envío del formulario
     */
    async _handleSubmitTransaction() {
        const form = document.getElementById('transaction-form');
        const formData = new FormData(form);
        const modal = document.getElementById('transaction-modal');
        
        const transactionData = {
            type: modal.dataset.transactionType,
            amount: formData.get('amount'),
            category: formData.get('category'),
            date: formData.get('date'),
            description: formData.get('description')
        };

        const result = await this.transactionManager.addTransaction(transactionData);
        
        if (result.success) {
            this._hideModal();
            this._updateTransactionsList();
            this._updateStatistics();
            this._showNotification('Transacción agregada exitosamente', 'success');
        } else {
            this._showNotification(result.message, 'error');
        }
    }

    /**
     * Actualizar lista de transacciones
     */
    _updateTransactionsList() {
        let transactions = this.transactionManager.transactions;
        
        // Aplicar filtros
        if (appState.currentFilter !== 'all') {
            transactions = this.transactionManager.filterByType(appState.currentFilter);
        }
        
        // Aplicar búsqueda
        if (appState.searchQuery) {
            transactions = this.transactionManager.searchTransactions(appState.searchQuery);
        }
        
        this._renderTransactions(transactions);
    }

    /**
     * Renderizar transacciones en la lista
     */
    _renderTransactions(transactions) {
        const listContainer = document.getElementById('transactions-list');
        if (!listContainer) return;
        
        // Limpiar contenedor
        listContainer.innerHTML = '';
        
        if (transactions.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No hay transacciones que coincidan con los filtros</p>';
            listContainer.appendChild(emptyState);
            return;
        }
        
        transactions.forEach(transaction => {
            const transactionItem = this._createTransactionElement(transaction);
            listContainer.appendChild(transactionItem);
        });
    }

    /**
     * Crear elemento de transacción
     */
    _createTransactionElement(transaction) {
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.type}`;
        
        const icon = document.createElement('div');
        icon.className = 'transaction-icon';
        icon.textContent = transaction.type === 'income' ? '📈' : '📉';
        
        const details = document.createElement('div');
        details.className = 'transaction-details';
        
        const category = document.createElement('div');
        category.className = 'transaction-category';
        category.textContent = transaction.category;
        
        const description = document.createElement('div');
        description.className = 'transaction-description';
        description.textContent = transaction.description || 'Sin descripción';
        
        const date = document.createElement('div');
        date.className = 'transaction-date';
        date.textContent = this._formatDate(transaction.date);
        
        details.appendChild(category);
        details.appendChild(description);
        details.appendChild(date);
        
        const amount = document.createElement('div');
        amount.className = `transaction-amount ${transaction.type}`;
        const prefix = transaction.type === 'income' ? '+' : '-';
        amount.textContent = `${prefix}$${this._formatAmount(transaction.amount)}`;
        
        item.appendChild(icon);
        item.appendChild(details);
        item.appendChild(amount);
        
        return item;
    }

    /**
     * Actualizar estadísticas en la UI
     */
    _updateStatistics() {
        const stats = this.transactionManager.getStatistics();
        
        document.getElementById('total-income').textContent = `$${this._formatAmount(stats.totalIncome)}`;
        document.getElementById('total-expense').textContent = `$${this._formatAmount(stats.totalExpense)}`;
        document.getElementById('total-balance').textContent = `$${this._formatAmount(stats.balance)}`;
    }

    /**
     * Actualizar información de ordenamiento
     */
    _updateSortInfo() {
        const sortInfo = document.getElementById('sort-info');
        const sortLabels = {
            'date_desc': 'Ordenado por fecha (descendente)',
            'date_asc': 'Ordenado por fecha (ascendente)',
            'amount_desc': 'Ordenado por monto (mayor a menor)',
            'amount_asc': 'Ordenado por monto (menor a mayor)',
            'category_asc': 'Ordenado por categoría (A-Z)'
        };
        
        sortInfo.textContent = sortLabels[appState.currentSort] || 'Ordenado por fecha (descendente)';
    }

    /**
     * Poblar categorías en el select
     */
    _populateCategories(select, type) {
        const categories = {
            income: [
                'Salario',
                'Freelance',
                'Inversiones',
                'Ventas',
                'Bonificaciones',
                'Otros ingresos'
            ],
            expense: [
                'Alimentación',
                'Transporte',
                'Vivienda',
                'Entretenimiento',
                'Salud',
                'Educación',
                'Ropa',
                'Servicios',
                'Otros gastos'
            ]
        };
        
        select.innerHTML = '<option value="">Seleccionar categoría</option>' +
            categories[type].map(cat => `<option value="${cat}">${cat}</option>`).join('');
    }

    /**
     * Cargar transacciones desde el backend
     */
    async _loadTransactions() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            if (!user || !user.id) {
                console.warn('Usuario no autenticado, usando datos de ejemplo');
                this._loadMockTransactions();
                return;
            }

            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.TRANSACTIONS}?user_id=${user.id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                console.warn('Error al cargar transacciones desde backend, usando datos de ejemplo');
                this._loadMockTransactions();
                return;
            }

            const transactions = await response.json();
            this.transactionManager.transactions = transactions;
            this.transactionManager._updateStatistics();
            
        } catch (error) {
            console.error('Error al cargar transacciones:', error);
            this._loadMockTransactions();
        }
    }

    _loadMockTransactions() {
        // Datos de ejemplo para desarrollo
        const mockTransactions = [
            {
                id: 'txn_1',
                type: 'income',
                amount: 2500000,
                category: 'Salario',
                date: '2025-01-15',
                description: 'Salario mensual enero'
            },
            {
                id: 'txn_2',
                type: 'expense',
                amount: 150000,
                category: 'Alimentación',
                date: '2025-01-14',
                description: 'Supermercado'
            },
            {
                id: 'txn_3',
                type: 'expense',
                amount: 80000,
                category: 'Transporte',
                date: '2025-01-13',
                description: 'Gasolina'
            }
        ];
        
        this.transactionManager.transactions = mockTransactions;
        this.transactionManager._updateStatistics();
    }

    /**
     * Mostrar merge-sort en acción
     */
    _showMergeSortInAction(type) {
        const data = type === 'income' ? appState.incomes : appState.expenses;
        
        console.log(`🧮 Ejecutando merge-sort para ${type}...`);
        const startTime = performance.now();
        
        const sortedData = this.transactionManager.sorter.mergeSort([...data], 'amount', false);
        const stats = this.transactionManager.sorter.getSortStats();
        
        const endTime = performance.now();
        
        console.log(`✅ Merge-sort completado para ${type}:`);
        console.log(`   - Comparaciones: ${stats.comparisons}`);
        console.log(`   - Swaps: ${stats.swaps}`);
        console.log(`   - Tiempo: ${(endTime - startTime).toFixed(2)}ms`);
        console.log(`   - Datos ordenados:`, sortedData);
        
        this._showAlgorithmIndicator();
    }

    /**
     * Generar recomendaciones basadas en análisis de gastos
     */
    _generateRecommendations(sortedExpenses) {
        const recommendations = [];
        
        // Analizar el gasto más alto
        if (sortedExpenses.length > 0) {
            const highestExpense = sortedExpenses[0];
            if (highestExpense.amount > 500000) {
                recommendations.push(`Considera reducir gastos en ${highestExpense.category}`);
            }
        }
        
        // Analizar balance general
        if (appState.balance > 1000000) {
            recommendations.push('Excelente balance, considera invertir el excedente');
        } else if (appState.balance < 500000) {
            recommendations.push('Balance bajo, revisa tus gastos principales');
        }
        
        return recommendations.length > 0 ? recommendations : ['Mantén un control regular de tus finanzas'];
    }

    /**
     * Generar alertas financieras
     */
    _generateAlerts() {
        const alerts = [];
        
        // Verificar gastos altos
        const highExpenses = appState.expenses.filter(expense => expense.amount > 600000);
        if (highExpenses.length > 0) {
            alerts.push(`${highExpenses.length} gastos superiores a $600.000`);
        }
        
        // Verificar tendencias
        if (appState.expenseTrend > 5) {
            alerts.push('Gastos aumentando significativamente');
        }
        
        return alerts.length > 0 ? alerts : ['No hay alertas activas'];
    }

    /**
     * Mostrar notificación usando el sistema global de errores
     */
    _showNotification(message, type = 'info', details = null) {
        console.log(`[${type.toUpperCase()}] ${message}`, details || '');
        
        // Usar el sistema global de manejo de errores si está disponible
        if (window.errorHandler) {
            switch (type) {
                case 'success':
                    window.errorHandler.showSuccess(message, details);
                    break;
                case 'error':
                    window.errorHandler.showError(message, details);
                    break;
                case 'warning':
                    window.errorHandler.showWarning(message, details);
                    break;
                case 'info':
                default:
                    window.errorHandler.showInfo(message, details);
                    break;
            }
        } else {
            // Fallback al sistema anterior si no está disponible el global
            this._showNotificationFallback(message, type);
        }
    }

    /**
     * Sistema de notificación fallback (método anterior)
     */
    _showNotificationFallback(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'warning' ? '#f59e0b' : type === 'info' ? '#3b82f6' : type === 'error' ? '#ef4444' : '#16a34a'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 500;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    // Métodos auxiliares
    _formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-CO');
    }

    _formatAmount(amount) {
        return amount.toLocaleString('es-CO');
    }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====
let transactionManager;
let incomeExpenseUI;

/**
 * Inicializar el módulo de ingresos y gastos
 */
async function initializeIncomeExpenses() {
    try {
        transactionManager = new TransactionManager();
        incomeExpenseUI = new IncomeExpenseUI(transactionManager);
        
        await incomeExpenseUI.initialize();
        
        console.log('Módulo de Ingresos/Gastos inicializado exitosamente');
        console.log('Algoritmo merge-sort disponible para ordenamiento de transacciones');
        
    } catch (error) {
        console.error('Error al inicializar módulo de ingresos/gastos:', error);
    }
}

// Exportar para uso global
window.initializeIncomeExpenses = initializeIncomeExpenses;
window.TransactionSorter = TransactionSorter;
window.TransactionManager = TransactionManager;
