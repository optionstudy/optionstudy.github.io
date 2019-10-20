function send(request, success, error) {
    var ajax = Ajax();
    if (!ajax) {
        return;
    }
    var method = request ? request.method || 'GET' : 'GET';
    ajax.open(method, request.url, true);
    if (request.header) {
        for (var i in request.header) {
            ajax.setRequestHeader(i, request.header[i]);
        }
    }
    ajax.onreadystatechange = function () {
        if (ajax.readyState != 4) {
            return;
        }
        if (ajax.status != 200 && ajax.status != 304) {
            var json = ajax.responseText;
            try {
                json = JSON.parse(ajax.responseText);
            } catch (e) {
                console.error(e);
            }
            error(json);
        } else {
            var json = ajax.responseText;
            try {
                json = JSON.parse(ajax.responseText);
            } catch (e) {
                console.error(e);
            }
            success(json);
        }        
    }
    if (ajax.readyState == 4) { return; }
    if (method == 'POST') {
        ajax.send(request.body);
    } else {
        ajax.send();
    }
}

function Ajax() {
    var XMLHttpFactories = [
        function () { return new XMLHttpRequest() },
        function () { return new ActiveXObject("Msxml3.XMLHTTP") },
        function () { return new ActiveXObject("Msxml2.XMLHTTP.6.0") },
        function () { return new ActiveXObject("Msxml2.XMLHTTP.3.0") },
        function () { return new ActiveXObject("Msxml2.XMLHTTP") },
        function () { return new ActiveXObject("Microsoft.XMLHTTP") }
    ];
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        }
        catch (e) {
            console.error(e);
            continue;
        }
        break;
    }
    return xmlhttp;
}
function pickval(a, b, undef) {
    if (a === undef) {
        return b;
    }
    return a;
}
function tolocal(o, splitter) {
    if (!splitter) {
        splitter = '/';
    }
    var rlt = o;
    if (typeof (o) == 'string') {
        var s = '' + o.toLowerCase();
        s = s.replace(/t/ig, ' ');
        if (s[s.length - 1] == 'z') {
            s = s.replace(/z/ig, ' UTC');
        }
        s = s.replace(/-/ig, '/');
        rlt = new Date(s);
    }
    var year = rlt.getFullYear();
    var month = (rlt.getMonth() + 1);
    var date = rlt.getDate();
    var hour = rlt.getHours();
    var minute = rlt.getMinutes();
    var second = rlt.getSeconds();
    if (hour == minute == second == 0) {
        return year + splitter + month + splitter + date;
    }
    return year + splitter + month + splitter + date + ' ' + hour + ':' + minute + ':' + second;
}

function initEl(targets) {
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];
        if (!target.attr) {
            target.attr = function (prop, val) {
                this[prop] = val;
                this.setAttribute(prop, val);
                return this;
            }
        }
    }
}

function add(arr, dat) {
    if (!arr) {
        return [dat];
    }
    if (!arr.length) {
        console.error(arr);
        return arr;
    }
    if (!arr.add) {
        arr.add = add;
    }
    arr[arr.length] = dat;
    return arr;
}
function join(o, t, opt) {
    if (opt.unique) {
        for (var i = 0; i < t.length; i++) {
            var flag = false;
            for (var j = 0; j < o.length; j++) {
                if (o[j] == t[i]) {
                    flag = true;
                    break;
                }
            }
            if (!flag) {
                o[o.length] = t[i];
            }
        }
    } else {
        for (var i = 0; i < t.length; i++) {
            o[o.length] = t[i];
        }
    }
    return o;
}
function combine(o, t, opt) {
    if (!opt.exclude) { opt.exclude = { 'prototype': true, 'constructor': true }; }
    for (var i in t) {
        if (t.hasOwnProperty(i) && !opt.exclude[i]) {
            var t2 = t[i];
            var o2 = o[i];
            o[i] = extend(o2, t2, opt);
        }
    }
}
function extend(o, t, opt, undef) {
    if (!opt) {
        opt = {};
    }
    if (o === undef || o === null) {
        return t;
    }
    var t = typeof (o);
    if (t == 'object') {
        if (o instanceof Array) {
            if (t instanceof Array) {
                for (var i = 0; i < o.length; i++) {
                    if (i >= t.length) {
                        break;
                    }
                    var o2 = o[i];
                    var t2 = t[i];
                    o[i] = extend(o2, t2, opt);
                }
                if (o.length < t.length) {
                    for (var i = o.length; i < t.length; i++) {
                        o[o.length] = t[i];
                    }
                }
            } else {
                combine(o, t, opt);
            }
        }
        return o;
    } else {
        return t;
    }
}
String.prototype.fix = function (n) {
    return '-';
}
Number.prototype.fix = function (n, threshold) {
    var p = '';
    var r = this.toFixed(n);
    if (threshold > 0 && this >= threshold) {
        if (r > 1000000000) {
            r /= 1000000000
            p = ' B';
        } else if (r > 1000000) {
            r /= 1000000;
            p = ' M';
        } else if (r > 1000) {
            r /= 1000;
            p = ' K';
        }
    }
    var i = parseInt(r);
    if (r + 0 == i) {
        if (threshold > 0) {
            return i + 'p';
        }
        return i;
    }
    if (threshold > 0) {
        return r + p;
    }
    return r;
}
Object.prototype.enum = function (handler, validator, undef) {
    if (handler) {
        if (validator && typeof (validator) == 'string') {
            var field = validator;
            validator = function (it) {
                return it[field] !== undef;
            }
        }
        if (this instanceof Array) {
            for (var i = 0; i < this.length; i++) {
                if (!validator || validator(this[i])) {
                    if (handler(this[i], i, this)) {
                        break;
                    }
                }
            }
        } else if (typeof (this) == 'object') {
            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    if (!validator || validator(this[i])) {
                        if (handler(this[i], i, this)) {
                            break;
                        }
                    }
                }
            }
        }
    }
}
function exec(exp, target, undef) {
    target = target || this;
    if (exp !== undef) {
        //var func = Function('a', 'b', 'return a + b');
        if (exp.indexOf('.') == 0) {
            exp = exp.substr(1);
            if (exp.indexOf('.') < 0) {
                return target[exp];
            } else {
                var list = exp.split('.');
                var t = target;
                for (var i = 0; i < list.length; i++) {
                    var f = list[i];
                    t = t[f];
                }
                return t;
            }
        } else {
            return target[exp];
        }
    }
}
Object.prototype.exec = exec;