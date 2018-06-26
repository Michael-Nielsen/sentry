import {CONDITION_OPERATORS} from '../data';

/*
* Returns options for condition field dropdown
*/
export function getConditionOptions(cols) {
  const columns = cols.map(({name}) => ({
    label: `${name}...`,
    value: name,
  }));

  const columnsWithConditions = cols.reduce((acc, {name}) => {
    return [
      ...acc,
      ...CONDITION_OPERATORS.map(op => ({
        label: `${name} ${op}`,
        value: `${name} ${op}`,
      })),
    ];
  }, []);

  return {
    columns,
    columnsWithConditions,
    all: [...columns, ...columnsWithConditions],
  };
}

export function isValidCondition(condition, cols) {
  const columns = new Set(cols.map(({name}) => name));
  const allOperators = new Set(CONDITION_OPERATORS);
  const specialConditions = new Set(['IS NULL', 'IS NOT NULL']);

  const isColValid = columns.has(condition[0]);
  const isOperatorValid = allOperators.has(condition[1]);

  const isValueValid =
    specialConditions.has(condition[1]) ||
    typeof condition[2] === (cols.find(col => col.name === condition[0]) || {}).type;

  return isColValid && isOperatorValid && isValueValid;
}

export function getInternal(external) {
  return external.join(' ');
}

export function getExternal(internal = '', columns) {
  const external = [null, null, null];

  // validate column
  const colValue = internal.split(' ')[0];
  if (new Set(columns.map(({name}) => name)).has(colValue)) {
    external[0] = colValue;
  }

  // Validate operator
  const operatorMatch = internal.match(/^[a-zA-Z0-9_\.:-]+ ([^\s]+).*$/);
  const operatorValue = operatorMatch ? operatorMatch[1] : null;

  if (new Set(CONDITION_OPERATORS).has(operatorValue)) {
    external[1] = operatorValue;
  }

  // Validate value and convert to correct type
  if (external[0] && external[1]) {
    const valuesMatch = internal.match(/^[a-zA-Z0-9_\.:-]+ [^\s]+ (.*)$/);
    external[2] = valuesMatch ? valuesMatch[1] : null;
    const type = columns.find(({name}) => name === colValue).type;
    if (type === 'number') {
      external[2] === parseInt(external[2], 10);
    }
  }

  return external;
}
