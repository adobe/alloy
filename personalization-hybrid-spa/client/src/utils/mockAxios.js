/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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