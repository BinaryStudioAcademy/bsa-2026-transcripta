"$spent / $limit" in mono — always two decimals, spaces around the slash. Amber at ≥80%, hard stop at 100% adds "Raise the limit".
```jsx
<BudgetMeter spent={0.98} limit={10}/>
<BudgetMeter spent={10} limit={10} onRaise={raise}/>
```