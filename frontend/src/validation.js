export function validateSum(value) {
  if (value === '.') {
    return '';
  }
  let data = value;
  if (data.startsWith('.')) {
    data = '0' + data;
  }

  // eslint-disable-next-line no-useless-escape
  data = data.replace(/[^.\d]+/g, '').replace(/^([^\.]*\.)|\./g, '$1');
  if (data.length === 0) return data;
  if (!/^(?=.*\d)\d*(?:\.\d{0,2})?$/.test(data)) {
    data = data.split('.');
    const cent = data[1].substring(0, 2);
    data = data[0] + '.' + cent;
  }
  return data;
}

export function notNullSumValid(value) {
  let data = value;
  if (!/[1-9]/.test(value)) {
    data = '';
  }
  return data;
}

export function deleteDodInSum(value) {
  let data = value;
  if (data.endsWith('.')) {
    data = data.substring(0, data.length - 1);
  }
  return data;
}

export function validateAccountNumber(value) {
  return value.replace(/[^\d]+/g, '');
}

export function lengthValidation(value, count) {
  if (value.length < count) {
    return false;
  } else {
    return true;
  }
}
