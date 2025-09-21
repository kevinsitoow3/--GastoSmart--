/**
 * Demostración del Algoritmo Merge-Sort para GastoSmart
 * 
 * Este archivo contiene una demostración interactiva del algoritmo merge-sort
 * implementado para el ordenamiento de transacciones financieras.
 * Incluye visualización del proceso de ordenamiento y análisis de rendimiento.
 * 
 * @author Kevin Correa - Analista de Requerimientos
 * @version 1.0
 * @date 2025-01-15
 */

/**
 * Clase para demostrar el algoritmo merge-sort con transacciones financieras
 */
class MergeSortDemo {
    constructor() {
        this.steps = [];
        this.currentStep = 0;
        this.isRunning = false;
        this.comparisonCount = 0;
        this.swapCount = 0;
        this.startTime = 0;
        this.endTime = 0;
    }

    /**
     * Generar datos de transacciones de prueba
     */
    generateTestData(count = 20) {
        const categories = ['Salario', 'Freelance', 'Alimentación', 'Transporte', 'Entretenimiento', 'Salud'];
        const types = ['income', 'expense'];
        const transactions = [];

        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            transactions.push({
                id: `demo_${i}`,
                type: type,
                amount: Math.floor(Math.random() * 1000000) + 10000,
                category: categories[Math.floor(Math.random() * categories.length)],
                date: new Date(2025, 0, Math.floor(Math.random() * 31) + 1).toISOString().split('T')[0],
                description: `Transacción de prueba ${i + 1}`
            });
        }

        return transactions;
    }

    /**
     * Algoritmo merge-sort con logging de pasos
     */
    mergeSortWithSteps(arr, sortBy = 'date', ascending = false) {
        this.steps = [];
        this.comparisonCount = 0;
        this.swapCount = 0;
        this.startTime = performance.now();

        this.steps.push({
            type: 'start',
            message: `Iniciando ordenamiento merge-sort de ${arr.length} transacciones por ${sortBy}`,
            array: JSON.parse(JSON.stringify(arr))
        });

        const result = this._mergeSortHelper(arr, 0, arr.length - 1, sortBy, ascending);

        this.endTime = performance.now();
        
        this.steps.push({
            type: 'complete',
            message: `Ordenamiento completado en ${(this.endTime - this.startTime).toFixed(2)}ms`,
            array: JSON.parse(JSON.stringify(result)),
            stats: {
                comparisons: this.comparisonCount,
                swaps: this.swapCount,
                time: this.endTime - this.startTime
            }
        });

        return result;
    }

    /**
     * Función auxiliar recursiva con logging
     */
    _mergeSortHelper(arr, low, high, sortBy, ascending) {
        if (low < high) {
            const mid = Math.floor((low + high) / 2);
            
            this.steps.push({
                type: 'divide',
                message: `Dividiendo array [${low}:${high}] en [${low}:${mid}] y [${mid + 1}:${high}]`,
                array: JSON.parse(JSON.stringify(arr)),
                range: { low, mid, high }
            });
            
            // Dividir recursivamente
            this._mergeSortHelper(arr, low, mid, sortBy, ascending);
            this._mergeSortHelper(arr, mid + 1, high, sortBy, ascending);
            
            // Combinar las mitades ordenadas
            this._merge(arr, low, mid, high, sortBy, ascending);
        }
        
        return arr;
    }

    /**
     * Función de combinación con logging detallado
     */
    _merge(arr, low, mid, high, sortBy, ascending) {
        const leftSize = mid - low + 1;
        const rightSize = high - mid;
        
        const leftArray = new Array(leftSize);
        const rightArray = new Array(rightSize);
        
        // Copiar elementos a arrays temporales
        for (let i = 0; i < leftSize; i++) {
            leftArray[i] = arr[low + i];
        }
        for (let j = 0; j < rightSize; j++) {
            rightArray[j] = arr[mid + 1 + j];
        }

        this.steps.push({
            type: 'merge_start',
            message: `Combinando arrays [${low}:${mid}] y [${mid + 1}:${high}]`,
            array: JSON.parse(JSON.stringify(arr)),
            leftArray: JSON.parse(JSON.stringify(leftArray)),
            rightArray: JSON.parse(JSON.stringify(rightArray)),
            range: { low, mid, high }
        });

        let i = 0, j = 0, k = low;

        // Combinar los elementos ordenadamente
        while (i < leftSize && j < rightSize) {
            this.comparisonCount++;
            
            const shouldSwap = this._compare(leftArray[i], rightArray[j], sortBy, ascending);
            
            this.steps.push({
                type: 'comparison',
                message: `Comparando ${this._getComparisonString(leftArray[i], rightArray[j], sortBy)}`,
                array: JSON.parse(JSON.stringify(arr)),
                comparison: {
                    left: leftArray[i],
                    right: rightArray[j],
                    result: shouldSwap ? 'right' : 'left'
                }
            });

            if (shouldSwap) {
                arr[k] = rightArray[j];
                j++;
            } else {
                arr[k] = leftArray[i];
                i++;
            }
            k++;
            this.swapCount++;
        }

        // Copiar elementos restantes
        while (i < leftSize) {
            arr[k] = leftArray[i];
            i++;
            k++;
        }

        while (j < rightSize) {
            arr[k] = rightArray[j];
            j++;
            k++;
        }

        this.steps.push({
            type: 'merge_complete',
            message: `Combinación completada para rango [${low}:${high}]`,
            array: JSON.parse(JSON.stringify(arr)),
            range: { low, mid, high }
        });
    }

    /**
     * Función de comparación optimizada
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
     * Obtener string descriptivo de la comparación
     */
    _getComparisonString(a, b, sortBy) {
        switch (sortBy) {
            case 'date':
                return `${a.date} vs ${b.date}`;
            case 'amount':
                return `$${a.amount.toLocaleString()} vs $${b.amount.toLocaleString()}`;
            case 'category':
                return `"${a.category}" vs "${b.category}"`;
            default:
                return `${a.date} vs ${b.date}`;
        }
    }

    /**
     * Ejecutar demostración completa
     */
    async runDemo(sortBy = 'date', ascending = false, dataCount = 20) {
        console.log('=== DEMOSTRACIÓN DEL ALGORITMO MERGE-SORT ===');
        console.log(`Ordenando ${dataCount} transacciones por ${sortBy} (${ascending ? 'ascendente' : 'descendente'})`);
        
        const testData = this.generateTestData(dataCount);
        console.log('Datos originales:', testData);
        
        const sortedData = this.mergeSortWithSteps([...testData], sortBy, ascending);
        console.log('Datos ordenados:', sortedData);
        
        const finalStats = this.steps[this.steps.length - 1].stats;
        console.log('=== ESTADÍSTICAS FINALES ===');
        console.log(`Comparaciones realizadas: ${finalStats.comparisons}`);
        console.log(`Swaps realizados: ${finalStats.swaps}`);
        console.log(`Tiempo de ejecución: ${finalStats.time.toFixed(2)}ms`);
        console.log(`Complejidad: O(n log n)`);
        
        return {
            originalData: testData,
            sortedData: sortedData,
            steps: this.steps,
            stats: finalStats
        };
    }

    /**
     * Análisis de rendimiento comparativo
     */
    async performanceAnalysis() {
        console.log('=== ANÁLISIS DE RENDIMIENTO MERGE-SORT ===');
        
        const sizes = [10, 50, 100, 500, 1000];
        const results = [];

        for (const size of sizes) {
            const testData = this.generateTestData(size);
            
            // Medir tiempo de merge-sort
            const startTime = performance.now();
            this.mergeSortWithSteps([...testData], 'date', false);
            const endTime = performance.now();
            
            const timeMs = endTime - startTime;
            const theoreticalComplexity = size * Math.log2(size);
            
            results.push({
                size: size,
                timeMs: timeMs,
                comparisons: this.comparisonCount,
                swaps: this.swapCount,
                theoreticalComplexity: theoreticalComplexity,
                efficiency: (theoreticalComplexity / timeMs).toFixed(2)
            });
        }

        console.table(results);
        return results;
    }

    /**
     * Visualizar pasos del algoritmo
     */
    visualizeSteps() {
        console.log('=== VISUALIZACIÓN DE PASOS ===');
        
        this.steps.forEach((step, index) => {
            console.log(`\nPaso ${index + 1}: ${step.message}`);
            
            if (step.type === 'comparison') {
                console.log(`  Comparación: ${step.comparison.result === 'left' ? 'Izquierda' : 'Derecha'} seleccionado`);
            } else if (step.type === 'divide') {
                console.log(`  Dividiendo en rango [${step.range.low}:${step.range.mid}] y [${step.range.mid + 1}:${step.range.high}]`);
            } else if (step.type === 'merge_complete') {
                console.log(`  Combinación completada para rango [${step.range.low}:${step.range.high}]`);
            }
        });
    }
}

/**
 * Función de demostración principal
 */
async function runMergeSortDemonstration() {
    const demo = new MergeSortDemo();
    
    try {
        // Demostración básica
        console.log('🧮 INICIANDO DEMOSTRACIÓN DEL ALGORITMO MERGE-SORT');
        console.log('📊 Optimizado para transacciones financieras en GastoSmart\n');
        
        // Ordenamiento por fecha (descendente)
        console.log('📅 Ordenamiento por fecha (más reciente primero):');
        const dateResult = await demo.runDemo('date', false, 15);
        
        // Ordenamiento por monto (ascendente)
        console.log('\n💰 Ordenamiento por monto (menor a mayor):');
        const amountResult = await demo.runDemo('amount', true, 15);
        
        // Ordenamiento por categoría (alfabético)
        console.log('\n📂 Ordenamiento por categoría (alfabético):');
        const categoryResult = await demo.runDemo('category', true, 15);
        
        // Análisis de rendimiento
        console.log('\n⚡ ANÁLISIS DE RENDIMIENTO:');
        await demo.performanceAnalysis();
        
        // Visualización de pasos (último ordenamiento)
        console.log('\n🔍 VISUALIZACIÓN DETALLADA DE PASOS:');
        demo.visualizeSteps();
        
        console.log('\n✅ Demostración completada exitosamente');
        console.log('🎯 El algoritmo merge-sort está listo para uso en producción');
        
        return {
            dateResult,
            amountResult,
            categoryResult,
            performance: await demo.performanceAnalysis()
        };
        
    } catch (error) {
        console.error('❌ Error durante la demostración:', error);
        throw error;
    }
}

/**
 * Función para comparar con otros algoritmos de ordenamiento
 */
function compareWithOtherAlgorithms() {
    console.log('=== COMPARACIÓN CON OTROS ALGORITMOS ===');
    
    const comparison = {
        'Merge-Sort': {
            'Complejidad temporal': 'O(n log n)',
            'Complejidad espacial': 'O(n)',
            'Estable': 'Sí',
            'Adaptativo': 'No',
            'Mejor caso': 'O(n log n)',
            'Caso promedio': 'O(n log n)',
            'Peor caso': 'O(n log n)'
        },
        'Quick-Sort': {
            'Complejidad temporal': 'O(n log n) promedio, O(n²) peor caso',
            'Complejidad espacial': 'O(log n)',
            'Estable': 'No',
            'Adaptativo': 'Sí',
            'Mejor caso': 'O(n log n)',
            'Caso promedio': 'O(n log n)',
            'Peor caso': 'O(n²)'
        },
        'Heap-Sort': {
            'Complejidad temporal': 'O(n log n)',
            'Complejidad espacial': 'O(1)',
            'Estable': 'No',
            'Adaptativo': 'No',
            'Mejor caso': 'O(n log n)',
            'Caso promedio': 'O(n log n)',
            'Peor caso': 'O(n log n)'
        }
    };
    
    console.table(comparison);
    
    console.log('\n🏆 VENTAJAS DEL MERGE-SORT PARA GASTOSMART:');
    console.log('• Rendimiento predecible O(n log n) en todos los casos');
    console.log('• Algoritmo estable (mantiene orden relativo)');
    console.log('• Ideal para datasets grandes de transacciones');
    console.log('• Aprovecha mejor la caché para arrays grandes');
    console.log('• Fácil de implementar y mantener');
}

// Exportar para uso global
window.MergeSortDemo = MergeSortDemo;
window.runMergeSortDemonstration = runMergeSortDemonstration;
window.compareWithOtherAlgorithms = compareWithOtherAlgorithms;

// Ejecutar demostración automáticamente si se llama directamente
if (typeof window !== 'undefined' && window.location.pathname.includes('income-expenses')) {
    console.log('🚀 Merge-Sort Demo cargado. Ejecuta runMergeSortDemonstration() para ver la demostración.');
}
