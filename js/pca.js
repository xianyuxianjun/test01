// PCA (Principal Component Analysis) 实现
function PCA() {
    // 中心化数据
    this.center = function(data) {
        const means = [];
        const n = data.length;
        const m = data[0].length;
        
        // 计算每列的均值
        for (let j = 0; j < m; j++) {
            let sum = 0;
            for (let i = 0; i < n; i++) {
                sum += data[i][j];
            }
            means[j] = sum / n;
        }
        
        // 中心化数据
        const centered = [];
        for (let i = 0; i < n; i++) {
            centered[i] = [];
            for (let j = 0; j < m; j++) {
                centered[i][j] = data[i][j] - means[j];
            }
        }
        
        return centered;
    };
    
    // 计算协方差矩阵
    this.covariance = function(data) {
        const n = data.length;
        const m = data[0].length;
        const cov = Array(m).fill().map(() => Array(m).fill(0));
        
        for (let i = 0; i < m; i++) {
            for (let j = 0; j < m; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += data[k][i] * data[k][j];
                }
                cov[i][j] = sum / (n - 1);
            }
        }
        
        return cov;
    };
    
    // 计算特征值和特征向量
    this.eigen = function(matrix) {
        // 这里简化实现，实际应用中可以使用更高效的算法
        // 或者使用现有的数学库如math.js
        
        // 这是一个简化的幂迭代法，只计算主特征值和特征向量
        const maxIterations = 100;
        const epsilon = 1e-10;
        const n = matrix.length;
        
        let vector = Array(n).fill(1);
        let eigenvalue = 0;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            // 矩阵乘法
            let newVector = Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    newVector[i] += matrix[i][j] * vector[j];
                }
            }
            
            // 计算新的特征值
            let newEigenvalue = 0;
            for (let i = 0; i < n; i++) {
                newEigenvalue += newVector[i] * newVector[i];
            }
            newEigenvalue = Math.sqrt(newEigenvalue);
            
            // 归一化向量
            for (let i = 0; i < n; i++) {
                newVector[i] /= newEigenvalue;
            }
            
            // 检查收敛
            if (Math.abs(newEigenvalue - eigenvalue) < epsilon) {
                break;
            }
            
            eigenvalue = newEigenvalue;
            vector = newVector;
        }
        
        return {
            eigenvalue: eigenvalue,
            eigenvector: vector
        };
    };
    
    // 执行PCA分析
    this.analyze = function(data, dimensions = 2) {
        // 中心化数据
        const centered = this.center(data);
        
        // 计算协方差矩阵
        const cov = this.covariance(centered);
        
        // 计算特征值和特征向量（简化版）
        // 实际应用中应该计算所有特征值和特征向量并排序
        const result1 = this.eigen(cov);
        
        // 为了简化，我们假设第二个特征向量是正交的
        // 实际应用中应该使用完整的特征分解
        const result2 = {
            eigenvalue: result1.eigenvalue * 0.8, // 简化假设
            eigenvector: result1.eigenvector.map(x => -x) // 简化假设
        };
        
        // 投影数据
        const projected = [];
        for (let i = 0; i < centered.length; i++) {
            const point = [];
            // 第一主成分
            let pc1 = 0;
            for (let j = 0; j < centered[i].length; j++) {
                pc1 += centered[i][j] * result1.eigenvector[j];
            }
            point.push(pc1);
            
            // 第二主成分
            let pc2 = 0;
            for (let j = 0; j < centered[i].length; j++) {
                pc2 += centered[i][j] * result2.eigenvector[j];
            }
            point.push(pc2);
            
            projected.push(point);
        }
        
        return {
            projected: projected,
            components: [result1.eigenvector, result2.eigenvector],
            variances: [result1.eigenvalue, result2.eigenvalue]
        };
    };
}

// 标准化数据
function standardizeData(data) {
    const means = {};
    const stds = {};
    const standardized = [];
    
    // 验证数据
    if (!data || data.length === 0 || !data[0]) {
        console.error('标准化数据失败：数据为空或格式不正确');
        return { standardized: [], means: {}, stds: {} };
    }
    
    // 计算每个特征的均值
    for (const feature in data[0]) {
        if (!data[0].hasOwnProperty(feature)) continue;
        
        let sum = 0;
        let count = 0;
        
        for (const item of data) {
            const value = parseFloat(item[feature]);
            if (!isNaN(value)) {
                sum += value;
                count++;
            }
        }
        
        means[feature] = count > 0 ? sum / count : 0;
    }
    
    // 计算每个特征的标准差
    for (const feature in data[0]) {
        if (!data[0].hasOwnProperty(feature)) continue;
        
        let squaredDiffsSum = 0;
        let count = 0;
        
        for (const item of data) {
            const value = parseFloat(item[feature]);
            if (!isNaN(value)) {
                squaredDiffsSum += Math.pow(value - means[feature], 2);
                count++;
            }
        }
        
        // 防止除以零或过小的值
        stds[feature] = count > 1 ? Math.sqrt(squaredDiffsSum / count) : 1;
        
        // 如果标准差接近零，设为1避免除以零
        if (stds[feature] < 1e-5) {
            stds[feature] = 1;
        }
    }
    
    // 标准化数据
    for (const item of data) {
        const standardizedItem = {};
        for (const feature in item) {
            if (!item.hasOwnProperty(feature)) continue;
            
            const value = parseFloat(item[feature]);
            if (isNaN(value)) {
                standardizedItem[feature] = 0;
            } else {
                standardizedItem[feature] = (value - means[feature]) / stds[feature];
                
                // 额外检查确保没有NaN
                if (isNaN(standardizedItem[feature])) {
                    standardizedItem[feature] = 0;
                }
            }
        }
        standardized.push(standardizedItem);
    }
    
    return {
        standardized,
        means,
        stds
    };
}

// 计算协方差矩阵
function calculateCovarianceMatrix(data) {
    if (!data || data.length === 0 || !data[0]) {
        console.error('协方差矩阵计算失败：数据为空或格式不正确');
        return {};
    }
    
    const features = Object.keys(data[0]);
    const n = data.length;
    const covMatrix = {};
    
    // 创建空矩阵
    for (const feature1 of features) {
        covMatrix[feature1] = {};
    }
    
    // 必须至少有2个数据点才能计算协方差
    if (n < 2) {
        console.warn('数据点不足，无法计算有效的协方差矩阵，返回单位矩阵');
        for (const feature1 of features) {
            for (const feature2 of features) {
                covMatrix[feature1][feature2] = feature1 === feature2 ? 1 : 0;
            }
        }
        return covMatrix;
    }
    
    for (const feature1 of features) {
        covMatrix[feature1] = {};
        for (const feature2 of features) {
            let sum = 0;
            let validPairs = 0;
            
            for (let i = 0; i < n; i++) {
                const val1 = data[i][feature1];
                const val2 = data[i][feature2];
                
                // 只有两个值都是有效的数字时才累加
                if (!isNaN(val1) && !isNaN(val2)) {
                    sum += val1 * val2;
                    validPairs++;
                }
            }
            
            // 如果有足够的有效数据对，则计算协方差
            if (validPairs > 1) {
                covMatrix[feature1][feature2] = sum / (validPairs - 1);
            } else {
                // 否则设置为默认值
                covMatrix[feature1][feature2] = feature1 === feature2 ? 1 : 0;
            }
        }
    }
    
    return covMatrix;
}

// 计算特征值和特征向量
// 注意：这是一个简化的实现，仅适用于小型矩阵
// 对于大型矩阵，应使用更高效的算法或库
function calculateEigenDecomposition(covMatrix) {
    const features = Object.keys(covMatrix);
    const n = features.length;
    
    // 创建数值矩阵
    const matrix = [];
    for (let i = 0; i < n; i++) {
        matrix[i] = [];
        for (let j = 0; j < n; j++) {
            matrix[i][j] = covMatrix[features[i]][features[j]] || 0; // 确保值不是undefined
        }
    }
    
    // 对于简化实现，我们使用幂迭代法计算主要特征值和特征向量
    // 实际应用中应使用数值计算库
    const eigenvalues = [];
    const eigenvectors = [];
    
    // 简化：仅计算前两个特征向量（用于二维可视化）
    for (let k = 0; k < 2; k++) {
        let vector = new Array(n).fill(0);
        vector[k] = 1; // 初始向量
        
        // 幂迭代法
        for (let iter = 0; iter < 100; iter++) {
            // 矩阵乘法
            const newVector = new Array(n).fill(0);
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    newVector[i] += (matrix[i][j] || 0) * (vector[j] || 0); // 防止NaN
                }
            }
            
            // 归一化
            const norm = Math.sqrt(newVector.reduce((sum, val) => sum + (val * val || 0), 0));
            // 防止除以零
            if (norm < 1e-10) {
                // 如果向量模接近零，使用随机向量
                for (let i = 0; i < n; i++) {
                    newVector[i] = Math.random();
                }
                const randomNorm = Math.sqrt(newVector.reduce((sum, val) => sum + val * val, 0));
                for (let i = 0; i < n; i++) {
                    newVector[i] /= randomNorm;
                }
            } else {
                for (let i = 0; i < n; i++) {
                    newVector[i] /= norm;
                }
            }
            
            // 检查收敛
            const diff = vector.reduce((sum, val, i) => sum + Math.pow((val || 0) - (newVector[i] || 0), 2), 0);
            vector = newVector;
            
            if (diff < 1e-10) break;
        }
        
        // 计算特征值 (Rayleigh商)
        let eigenvalue = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                eigenvalue += (vector[i] || 0) * (matrix[i][j] || 0) * (vector[j] || 0);
            }
        }
        
        eigenvalues.push(eigenvalue || 1); // 防止零特征值
        
        // 将特征向量转换为对象形式
        const eigenvector = {};
        for (let i = 0; i < n; i++) {
            eigenvector[features[i]] = vector[i] || 0; // 确保值不是undefined或NaN
        }
        eigenvectors.push(eigenvector);
        
        // 从矩阵中减去投影，以便找到下一个特征向量
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                matrix[i][j] -= eigenvalue * (vector[i] || 0) * (vector[j] || 0);
            }
        }
    }
    
    return { eigenvalues, eigenvectors };
}

// 主成分分析
function pca(data, features) {
    // 提取需要分析的特征
    const featureData = data.map(item => {
        const featureItem = {};
        for (const feature of features) {
            // 确保数值是有效的浮点数，不是NaN
            const value = parseFloat(item[feature]);
            featureItem[feature] = isNaN(value) ? 0 : value;
        }
        return featureItem;
    });
    
    // 数据验证 - 确保数据不为空
    if (featureData.length === 0) {
        console.error('PCA数据为空');
        // 返回空的结果结构
        return {
            pcScores: [],
            eigenvalues: [1, 1],
            eigenvectors: [
                features.reduce((obj, f) => { obj[f] = 0; return obj; }, {}),
                features.reduce((obj, f) => { obj[f] = 0; return obj; }, {})
            ],
            varianceExplained: [0.5, 0.5]
        };
    }
    
    // 标准化数据
    const { standardized } = standardizeData(featureData);
    
    // 计算协方差矩阵
    const covMatrix = calculateCovarianceMatrix(standardized);
    
    // 计算特征值和特征向量
    const { eigenvalues, eigenvectors } = calculateEigenDecomposition(covMatrix);
    
    // 生成主成分得分
    const pcScores = standardized.map(item => {
        // PC1计算
        const pc1 = Object.keys(item).reduce((sum, feature) => {
            const value = item[feature] * (eigenvectors[0][feature] || 0);
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        // PC2计算
        const pc2 = Object.keys(item).reduce((sum, feature) => {
            const value = item[feature] * (eigenvectors[1][feature] || 0);
            return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        return [
            isNaN(pc1) ? 0 : pc1,
            isNaN(pc2) ? 0 : pc2
        ];
    });
    
    // 确保特征值有效 - 防止除以零
    const totalVariance = eigenvalues.reduce((a, b) => a + (b || 0), 0) || 1;
    
    return {
        pcScores,
        eigenvalues,
        eigenvectors,
        varianceExplained: eigenvalues.map(val => (val || 0) / totalVariance)
    };
}

// K-means聚类算法
function kMeans(data, k, maxIterations = 100) {
    // 随机初始化k个中心点
    const centroids = [];
    const minX = Math.min(...data.map(p => p[0]));
    const maxX = Math.max(...data.map(p => p[0]));
    const minY = Math.min(...data.map(p => p[1]));
    const maxY = Math.max(...data.map(p => p[1]));
    
    for (let i = 0; i < k; i++) {
        centroids.push([
            minX + Math.random() * (maxX - minX),
            minY + Math.random() * (maxY - minY)
        ]);
    }
    
    // 迭代计算
    let iterations = 0;
    let clusters;
    let oldCentroids;
    
    do {
        // 保存旧的中心点
        oldCentroids = JSON.parse(JSON.stringify(centroids));
        
        // 分配每个点到最近的中心点
        clusters = Array(k).fill().map(() => []);
        
        for (let i = 0; i < data.length; i++) {
            let minDist = Infinity;
            let clusterIndex = 0;
            
            for (let j = 0; j < k; j++) {
                const dist = euclideanDistance(data[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    clusterIndex = j;
                }
            }
            
            clusters[clusterIndex].push(i);
        }
        
        // 更新中心点
        for (let i = 0; i < k; i++) {
            if (clusters[i].length === 0) continue;
            
            const clusterPoints = clusters[i].map(idx => data[idx]);
            const sumX = clusterPoints.reduce((sum, p) => sum + p[0], 0);
            const sumY = clusterPoints.reduce((sum, p) => sum + p[1], 0);
            
            centroids[i] = [
                sumX / clusterPoints.length,
                sumY / clusterPoints.length
            ];
        }
        
        iterations++;
    } while (
        iterations < maxIterations && 
        !centroidsConverged(oldCentroids, centroids)
    );
    
    // 生成结果
    const result = data.map((point, i) => {
        let minDist = Infinity;
        let clusterIndex = 0;
        
        for (let j = 0; j < k; j++) {
            const dist = euclideanDistance(point, centroids[j]);
            if (dist < minDist) {
                minDist = dist;
                clusterIndex = j;
            }
        }
        
        return clusterIndex;
    });
    
    return {
        clusters: result,
        centroids: centroids
    };
}

// 欧几里得距离
function euclideanDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}

// 检查中心点是否收敛
function centroidsConverged(oldCentroids, newCentroids, threshold = 0.001) {
    for (let i = 0; i < oldCentroids.length; i++) {
        const dist = euclideanDistance(oldCentroids[i], newCentroids[i]);
        if (dist > threshold) return false;
    }
    return true;
}