One card anatomy (headline · reason · estimate · actions) for every empty and degraded state: queue slow, budget exhausted, service unavailable, page failed, plain empty.
```jsx
<StateCard headline="Preparing the next pages" reason="The model is reading ahead of you." estimate="about 40 seconds" actions={[{label:'Review the ready ones'},{label:'Pause',variant:'ghost'}]}/>
```