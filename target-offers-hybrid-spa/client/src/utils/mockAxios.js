export default {
  post: (entity, data) => {
    return new Promise((resolve) => {
      var entityCollection = JSON.parse(localStorage.getItem(entity)) || {},
        key = Date.now();
      entityCollection[Date.now()] = data;
      localStorage.setItem(entity, JSON.stringify(entityCollection));
      resolve({data: {name: key}});
    });
  },

  get: (entity) => {
    return new Promise((resolve) => {
      var entityCollection = JSON.parse(localStorage.getItem(entity)) || {};
      resolve({data: entityCollection});
    });
  },

  delete: (entity, key) => {
    return new Promise((resolve) => {
      var entityCollection = JSON.parse(localStorage.getItem(entity)) || {};
      delete entityCollection[key];
      localStorage.setItem(entity, JSON.stringify(entityCollection));
      resolve({data: null});
    });
  },

  deleteAll: (entity) => {
    return new Promise((resolve) => {
      localStorage.removeItem(entity);
      resolve({data: null});
    });
  }
};