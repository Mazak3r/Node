(function () {
  const displayEl = document.getElementById('display');
  const historyEl = document.getElementById('history');

  const opSymbols = {
    add: '+',
    subtract: '−',
    multiply: '×',
    divide: '÷',
  };

  let current = '0';
  let previous = null;
  let pendingOp = null;
  let justEvaluated = false;

  function formatNumber(num) {
    if (!isFinite(num)) return 'Error';
    const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10;
    const str = rounded.toString();
    if (str.length > 12) {
      return rounded.toExponential(6);
    }
    return str;
  }

  function updateDisplay() {
    displayEl.textContent = current;
    if (previous !== null && pendingOp) {
      historyEl.textContent = `${formatNumber(previous)} ${opSymbols[pendingOp]}`;
    } else {
      historyEl.textContent = '';
    }
    clearActiveOpKeys();
    if (pendingOp && !justEvaluated) {
      const btn = document.querySelector(`[data-action="${pendingOp}"]`);
      if (btn) btn.classList.add('active');
    }
  }

  function clearActiveOpKeys() {
    document.querySelectorAll('.key--op').forEach((k) => k.classList.remove('active'));
  }

  function inputDigit(digit) {
    if (justEvaluated) {
      current = digit === '.' ? '0.' : digit;
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (current === '0' && digit !== '.') {
      current = digit;
    } else {
      current += digit;
    }
    updateDisplay();
  }

  function inputDecimal() {
    if (justEvaluated) {
      current = '0.';
      justEvaluated = false;
      updateDisplay();
      return;
    }
    if (!current.includes('.')) {
      current += '.';
      updateDisplay();
    }
  }

  function clearAll() {
    current = '0';
    previous = null;
    pendingOp = null;
    justEvaluated = false;
    updateDisplay();
  }

  function negate() {
    if (current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    updateDisplay();
  }

  function percent() {
    const val = parseFloat(current);
    current = formatNumber(val / 100);
    updateDisplay();
  }

  function compute(a, b, op) {
    switch (op) {
      case 'add': return a + b;
      case 'subtract': return a - b;
      case 'multiply': return a * b;
      case 'divide': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function setOperator(op) {
    const val = parseFloat(current);
    if (pendingOp && !justEvaluated) {
      const result = compute(previous, val, pendingOp);
      previous = result;
      current = formatNumber(result);
    } else {
      previous = val;
    }
    pendingOp = op;
    justEvaluated = true;
    updateDisplay();
  }

  function equals() {
    if (pendingOp === null || previous === null) return;
    const val = parseFloat(current);
    const result = compute(previous, val, pendingOp);
    current = formatNumber(result);
    previous = null;
    pendingOp = null;
    justEvaluated = true;
    updateDisplay();
  }

  document.querySelectorAll('.key').forEach((key) => {
    key.addEventListener('click', () => {
      const digit = key.dataset.digit;
      const action = key.dataset.action;

      if (digit !== undefined) {
        inputDigit(digit);
        return;
      }

      switch (action) {
        case 'clear': clearAll(); break;
        case 'negate': negate(); break;
        case 'percent': percent(); break;
        case 'decimal': inputDecimal(); break;
        case 'equals': equals(); break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
          setOperator(action);
          break;
      }
    });
  });

  const keyMap = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
    '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
  };

  window.addEventListener('keydown', (e) => {
    if (keyMap[e.key] !== undefined) {
      inputDigit(keyMap[e.key]);
    } else if (e.key === '.') {
      inputDecimal();
    } else if (e.key === '+') {
      setOperator('add');
    } else if (e.key === '-') {
      setOperator('subtract');
    } else if (e.key === '*') {
      setOperator('multiply');
    } else if (e.key === '/') {
      e.preventDefault();
      setOperator('divide');
    } else if (e.key === 'Enter' || e.key === '=') {
      equals();
    } else if (e.key === 'Backspace') {
      if (current.length > 1) {
        current = current.slice(0, -1);
      } else {
        current = '0';
      }
      updateDisplay();
    } else if (e.key === 'Escape') {
      clearAll();
    } else if (e.key === '%') {
      percent();
    }
  });

  updateDisplay();
})();
