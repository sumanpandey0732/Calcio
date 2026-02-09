// Calculator State
const calculator = {
    displayValue: '0',
    firstOperand: null,
    waitingForSecondOperand: false,
    operator: null,
    expression: ''
};

// DOM Elements
const resultDisplay = document.getElementById('result');
const expressionDisplay = document.getElementById('expression');
const buttons = document.querySelectorAll('.btn');

// Update the display
function updateDisplay() {
    resultDisplay.textContent = formatNumber(calculator.displayValue);
    expressionDisplay.textContent = calculator.expression;
}

// Format number for display (add commas, limit decimals)
function formatNumber(numStr) {
    if (numStr === 'Error') return numStr;

    const num = parseFloat(numStr);
    if (isNaN(num)) return '0';

    // Handle very large or very small numbers
    if (Math.abs(num) > 999999999999) {
        return num.toExponential(4);
    }

    // Format with commas and limit decimal places
    const parts = numStr.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts[1] && parts[1].length > 8) {
        parts[1] = parts[1].substring(0, 8);
    }

    return parts.join('.');
}

// Input a digit
function inputDigit(digit) {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = digit;
        calculator.waitingForSecondOperand = false;
    } else {
        // Limit input length
        if (calculator.displayValue.replace(/[^0-9]/g, '').length >= 15) return;

        calculator.displayValue = calculator.displayValue === '0'
            ? digit
            : calculator.displayValue + digit;
    }
}

// Input decimal point
function inputDecimal() {
    if (calculator.waitingForSecondOperand) {
        calculator.displayValue = '0.';
        calculator.waitingForSecondOperand = false;
        return;
    }

    if (!calculator.displayValue.includes('.')) {
        calculator.displayValue += '.';
    }
}

// Handle operators
function handleOperator(nextOperator) {
    const inputValue = parseFloat(calculator.displayValue);
    const operatorSymbols = {
        'add': '+',
        'subtract': '−',
        'multiply': '×',
        'divide': '÷'
    };

    if (calculator.operator && calculator.waitingForSecondOperand) {
        calculator.operator = nextOperator;
        calculator.expression = `${calculator.firstOperand} ${operatorSymbols[nextOperator]}`;
        updateOperatorHighlight(nextOperator);
        return;
    }

    if (calculator.firstOperand === null && !isNaN(inputValue)) {
        calculator.firstOperand = inputValue;
    } else if (calculator.operator) {
        const result = calculate(calculator.firstOperand, inputValue, calculator.operator);

        if (result === 'Error') {
            calculator.displayValue = 'Error';
            calculator.firstOperand = null;
            calculator.operator = null;
            calculator.waitingForSecondOperand = false;
            calculator.expression = '';
            updateDisplay();
            updateOperatorHighlight(null);
            return;
        }

        calculator.displayValue = String(result);
        calculator.firstOperand = result;
    }

    calculator.waitingForSecondOperand = true;
    calculator.operator = nextOperator;
    calculator.expression = `${calculator.firstOperand} ${operatorSymbols[nextOperator]}`;
    updateOperatorHighlight(nextOperator);
}

// Perform calculation
function calculate(firstOperand, secondOperand, operator) {
    switch (operator) {
        case 'add':
            return firstOperand + secondOperand;
        case 'subtract':
            return firstOperand - secondOperand;
        case 'multiply':
            return firstOperand * secondOperand;
        case 'divide':
            if (secondOperand === 0) return 'Error';
            return firstOperand / secondOperand;
        default:
            return secondOperand;
    }
}

// Handle equals
function handleEquals() {
    if (calculator.operator === null || calculator.waitingForSecondOperand) {
        return;
    }

    const operatorSymbols = {
        'add': '+',
        'subtract': '−',
        'multiply': '×',
        'divide': '÷'
    };

    const secondOperand = parseFloat(calculator.displayValue);
    const result = calculate(calculator.firstOperand, secondOperand, calculator.operator);

    if (result === 'Error') {
        calculator.displayValue = 'Error';
        calculator.expression = '';
    } else {
        calculator.expression = `${calculator.firstOperand} ${operatorSymbols[calculator.operator]} ${secondOperand} =`;
        calculator.displayValue = String(result);
    }

    calculator.firstOperand = null;
    calculator.operator = null;
    calculator.waitingForSecondOperand = false;
    updateOperatorHighlight(null);
}

// Clear calculator
function clearCalculator() {
    calculator.displayValue = '0';
    calculator.firstOperand = null;
    calculator.waitingForSecondOperand = false;
    calculator.operator = null;
    calculator.expression = '';
    updateOperatorHighlight(null);
}

// Toggle sign (+/-)
function toggleSign() {
    if (calculator.displayValue === '0' || calculator.displayValue === 'Error') return;

    calculator.displayValue = calculator.displayValue.startsWith('-')
        ? calculator.displayValue.slice(1)
        : '-' + calculator.displayValue;
}

// Convert to percentage
function handlePercent() {
    const currentValue = parseFloat(calculator.displayValue);
    if (isNaN(currentValue)) return;

    calculator.displayValue = String(currentValue / 100);
}

// Update operator button highlight
function updateOperatorHighlight(activeOperator) {
    document.querySelectorAll('.btn-operator').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.action === activeOperator) {
            btn.classList.add('active');
        }
    });
}

// Create ripple effect
function createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// Handle button clicks
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        createRipple(e, button);

        const action = button.dataset.action;

        // Handle different actions
        if (!isNaN(action)) {
            inputDigit(action);
        } else {
            switch (action) {
                case 'decimal':
                    inputDecimal();
                    break;
                case 'clear':
                    clearCalculator();
                    break;
                case 'toggle-sign':
                    toggleSign();
                    break;
                case 'percent':
                    handlePercent();
                    break;
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    handleOperator(action);
                    break;
                case 'equals':
                    handleEquals();
                    break;
            }
        }

        updateDisplay();
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    e.preventDefault();

    const key = e.key;

    if (/^[0-9]$/.test(key)) {
        inputDigit(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+') {
        handleOperator('add');
    } else if (key === '-') {
        handleOperator('subtract');
    } else if (key === '*') {
        handleOperator('multiply');
    } else if (key === '/') {
        handleOperator('divide');
    } else if (key === 'Enter' || key === '=') {
        handleEquals();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearCalculator();
    } else if (key === '%') {
        handlePercent();
    } else if (key === 'Backspace') {
        if (calculator.displayValue.length > 1) {
            calculator.displayValue = calculator.displayValue.slice(0, -1);
        } else {
            calculator.displayValue = '0';
        }
    }

    updateDisplay();
});

// Initialize display
updateDisplay();
