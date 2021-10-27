class EnumItem {
  constructor(key, value, originalKey) {
    this.key = key;
    this.originalKey = originalKey;
    this.value = value;
    Object.freeze(this);
  }

  is(value) {
    if (typeof value === "string") value = value.toUpperCase();
    if (this.key === value) return true;
    if (this.value === value) return true;
    return false;
  }
}

class EnumObject {
  constructor(keys = []) {
    if (keys instanceof Array) {
      this.enums = new Set();
      keys.forEach((key, index) => {
        const item = new EnumItem(key.toUpperCase(), index, key);
        this.enums.add(item);
        this[key.toUpperCase()] = item;
      });
    }
  }
  getKeyByValue(value) {
    for (const item of this.enums.values()) {
      if (item.val === value) {
        return item.key;
      }
    }
  }

  getKeys({ original = false } = { original: false }) {
    return Array.from(this.enums.values()).map(({ key, originalKey }) =>
      original ? originalKey : key
    );
  }

  getValueByKey(key) {
    key = key.toUpperCase();
    if (this[key]) return this[key].value;
  }

  get(key) {
    if (typeof key === "string") {
      key = key.toUpperCase();
      if (this[key]) return this[key].value;
    } else if (typeof key === "number") {
      for (const item of this.enums.values()) {
        if (item.val === key) {
          return item;
        }
      }
    }
  }
}

const EnumProxyHandler = {
  get(target, prop) {
    if (prop === "enums" || prop === "getKeys") return target[prop];

    if (target instanceof EnumObject) {
      if (!isNaN(parseInt(prop))) {
        return target.getKeyByValue(parseInt(prop));
      } else {
        return target.getValueByKey(prop);
      }
    }

    return target[prop];
  },
};

const Enum = (keys = []) => new Proxy(new EnumObject(keys), EnumProxyHandler);

module.exports = Enum;
