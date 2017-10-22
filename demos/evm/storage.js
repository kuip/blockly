(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.storagejs = factory();
    }
})(this, function() {
    return function(tableName) {
        var prefix = '_storage_js_';
        tableName = tableName === undefined ? 'storagejs' : tableName;
        tableName = prefix + tableName;
        var error = null;
        var localData = localStorage[tableName] ? JSON.parse(localStorage[tableName]) : [];
        var objectLength = function(obj) {
            var no = 0;
            for (var i in obj) {
                no++;
            }
            return no;
        }
        var _storage = {
            findById: function(id, callback) {
                var index = _storage.findIndexById(id);
                var result = null;
                if (index === null) {
                    error = 'Data with ID ' + id + ' not found.';
                } else {
                    result = localData[index];
                }
                if (callback) {
                    callback(error, result);
                } else {
                    return result;
                }
            },
            findIndexById: function(id, callback) {
                var result = null;
                for (var $index in localData) {
                    if (localData[$index]['_id'] == id) {
                        result = $index;
                    }
                }
                if (callback) {
                    callback(error, result);
                } else {
                    return result;
                }
            },
            findByAttributes: function(attr, callback) {
                var find = _storage.findAllByAttributes(attr);
                var result = null;
                if (find.length > 0) {
                    result = find[0];
                }
                if (callback) {
                    callback(error, result);
                } else {
                    return result;
                }
            },
            findAll: function(attr, limit, offset, callback) {
                return _storage.findAllByAttributes(attr, limit, offset, callback);
            },
            findAllByAttributes: function(attr, limit, offset, callback) {
                var result = [];
                var attrLength = objectLength(attr);
                for (var localIndex in localData) {
                    var _returnLength = attrLength;
                    for (var attrIndex in attr) {
                        if (localData[localIndex][attrIndex] == attr[attrIndex]) {
                            _returnLength--;
                        }
                    }
                    if (_returnLength === 0) {
                        result.push(localData[localIndex]);
                    }
                }
                return _storage.limit(result, limit, offset, callback);
            },
            findAllByAttribute: function(key, val, limit, offset, callback) {
                var result = [];
                for (var $index in localData) {
                    if (localData[$index][key] == val) {
                        result.push(localData[$index]);
                    }
                }
                return _storage.limit(result, limit, offset, callback);
            },
            findByAttribute: function(key, val, callback) {
                var find = _storage.findAllByAttribute(key, val);
                var result = null;
                if (find.length > 0) {
                    result = find[0];
                }
                if (callback) {
                    callback(error, result);
                } else {
                    return result;
                }
            },
            all: function(limit, offset, callback) {
                return _storage.limit(localData, limit, offset, callback);
            },
            limit: function(arr, _limit, _offset, _callback) {

                var callback = _limit;
                var limit = null;
                var offset = null;
                var backupArray = [];

                if (typeof _limit === 'number') {
                    limit = _limit;
                    callback = _offset;
                }
                if (typeof _offset === 'number') {
                    offset = _offset;
                    callback = _callback;
                }

                if (limit !== null)  {
                    var no = 0;
                    var no_offset = 0;
                    for(var i in arr) {
                        if (offset === null) {
                            if (no < limit) {
                                backupArray.push(arr[i]);
                            }
                        } else {
                            if (no >= offset && no_offset < limit) {
                                backupArray.push(arr[i]);
                                no_offset++;
                            }
                        }
                        no++;
                    }
                } else {
                    backupArray = arr;
                }

                if (callback) {
                    callback(error, backupArray);
                } else {
                    return backupArray;
                }
            },
            insert: function(id, attr, callback) {
                var data = attr;
                var cb = callback;
                if (typeof id === 'object') {
                    data = id;
                    cb = attr;
                } else {
                    data['_id'] = id;
                }
                if (!data['_id']) {
                    error = 'Please insert ID.';
                } else if (_storage.findById(data['_id']) === null) {
                    localData.push(data);
                    localStorage.setItem(tableName, JSON.stringify(localData));
                    error = null;
                } else {
                    error = 'Data with ID ' + data['_id'] + ' has been registered.';
                }
                if (cb) {
                    cb(error, null);
                } else {
                    return error !== null;
                }
            },
            batchInsert: function(attr, callback) {
                var validate = 0;
                for (var $index in attr) {
                    if (typeof attr[$index]['_id'] === 'undefined') {
                        validate++;
                    } else if (_storage.findIndexById(attr[$index]['_id']) !== null) {
                        validate++;
                    }
                }
                if (validate === 0) {
                    for (var $index in attr) {
                        _storage.insert(attr[$index]);
                    }
                } else {
                    error = 'Batch insert failed.';
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            updateById: function(id, attr, callback) {
                var find = _storage.findIndexById(id);
                if (find === null) {
                    error = 'Data with ID ' + id + ' not found.';
                } else {
                    var data = localData[find];
                    var validate = 0;
                    for (var keyAttr in attr) {
                        if (typeof data[keyAttr] === 'undefined') {
                            validate++;
                        } else {
                            data[keyAttr] = attr[keyAttr];
                        }
                    }
                    if (validate === 0) {
                        localData[find] = data;
                        error = null;
                        localStorage.setItem(tableName, JSON.stringify(localData));
                    } else {
                        error = 'Key Update not match.';
                    }
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            updateAllByAttributes: function(findAttr, dataAttr, callback) {
                var backup = localData;
                var findAttrLength = objectLength(findAttr);
                var errorKeyMatch = 0;
                var dataFound = 0;
                for (var localIndex in backup) {
                    var _returnLength = findAttrLength;
                    for (var findAttrIndex in findAttr) {
                        if (backup[localIndex][findAttrIndex] == findAttr[findAttrIndex]) {
                            _returnLength--;
                        }
                    }
                    if (_returnLength === 0) {
                        dataFound++;
                        var data = backup[localIndex];
                        var validate = 0;
                        for (var dataAttrIndex in dataAttr) {
                            if (typeof data[dataAttrIndex] === 'undefined') {
                                validate++;
                            } else {
                                data[dataAttrIndex] = dataAttr[dataAttrIndex];
                            }
                        }
                        if (validate === 0) {
                            backup[localIndex] = data;
                        } else {
                            errorKeyMatch++;
                        }
                    }
                }
                if (dataFound === 0) {
                    error = 'Data not found.';
                } else if (errorKeyMatch > 0) {
                    error = 'Key Update not match.';
                } else {
                    error = null;
                    localStorage.setItem(tableName, JSON.stringify(backup));
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            deleteById: function(id, callback) {
                var find = _storage.findIndexById(id);
                if (find === null) {
                    error = 'Data with ID ' + id + ' not found.';
                } else {
                    localData.splice(find, 1);
                    localStorage.setItem(tableName, JSON.stringify(localData));
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            deleteAllByAttribute: function(key, val, callback) {
                var found = 0;
                var newLocalData = [];
                for (var $index in localData) {
                    if (localData[$index][key] === val) {
                        found++;
                        //delete localData[$index];
                    } else {
                        newLocalData.push(localData[$index]);
                    }
                }
                if (found > 0) {
                    localStorage.setItem(tableName, JSON.stringify(newLocalData));
                } else {
                    error = 'Data not found.';
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            deleteAllByAttributes: function(attr, callback) {
                var newLocalData = [];
                var found = 0;
                var attrLength = objectLength(attr);
                for (var localIndex in localData) {
                    var _returnLength = attrLength;
                    for (var attrIndex in attr) {
                        if (localData[localIndex][attrIndex] == attr[attrIndex]) {
                            _returnLength--;
                        }
                    }
                    if (_returnLength === 0) {
                        found++;
                    } else {
                        newLocalData.push(localData[localIndex]);
                    }
                }
                if (found > 0) {
                    localStorage.setItem(tableName, JSON.stringify(newLocalData));
                } else {
                    error = 'Data not found.';
                }
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            deleteAll: function(callback) {
                localStorage.setItem(tableName, JSON.stringify([]));
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            },
            remove: function(callback) {
                localStorage.removeItem(tableName);
                if (callback) {
                    callback(error, null);
                } else {
                    return error !== null;
                }
            }
        }
        return _storage;
    }
});