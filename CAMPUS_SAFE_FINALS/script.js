/* ====================
  CONFIG - add your key
   ==================== */
const OPENWEATHER_API_KEY = "9d9f6f36546d0442f55deeb57e8b9553";

/* ====================
  OOP: Classes & Inheritance
  - ReportBase (abstract-like)
  - Report extends ReportBase (adds serialization)
  - ReportManager handles report collection (encapsulation)
  - User class manages user data
  ==================== */

class ReportBase {
  constructor(type, desc, lat = null, lon = null, createdBy = 'guest') {
    this._id = Date.now() + Math.floor(Math.random()*999);
    this._type = type;
    this._desc = desc;
    this._lat = lat;
    this._lon = lon;
    this._createdAt = new Date().toISOString();
    this._createdBy = createdBy;
  }
  // encapsulated getters
  get id(){ return this._id; }
  get type(){ return this._type; }
  get desc(){ return this._desc; }
  get lat(){ return this._lat; }
  get lon(){ return this._lon; }
  get createdAt(){ return this._createdAt; }
  get createdBy(){ return this._createdBy; }

  set type(v){ this._type = v; }
  set desc(v){ this._desc = v; }
  set lat(v){ this._lat = v; }
  set lon(v){ this._lon = v; }

  toJSON(){
    return {
      id: this._id, type: this._type, desc: this._desc,
      lat: this._lat, lon: this._lon, createdAt: this._createdAt, createdBy: this._createdBy
    };
  }
}

// Inheritance example: a SpecialReport extends ReportBase and adds severity
class SpecialReport extends ReportBase {
  constructor(type, desc, severity = 'Low', lat=null, lon=null, createdBy='guest'){
    super(type, desc, lat, lon, createdBy);
    this._severity = severity; // additional property
  }
  get severity(){ return this._severity; }
  set severity(s){ this._severity = s; }
  toJSON(){ return {...super.toJSON(), severity: this._severity}; }
}

/* ReportManager encapsulates report operations (CRUD) */
class ReportManager {
  constructor(storageKey = 'campus_reports_v1'){
    this.storageKey = storageKey;
    this.reports = JSON.parse(localStorage.getItem(this.storageKey) || '[]').map(r => r);
  }

  all(){ return this.reports.slice(); } // return copy

  add(report){
    // Report or plain object acceptable
    const rObj = report instanceof ReportBase ? report.toJSON() : report;
    this.reports.unshift(rObj);
    this._persist();
    return rObj;
  }

  update(id, patch){
    const idx = this.reports.findIndex(r => r.id === id);
    if(idx === -1) return null;
    this.reports[idx] = {...this.reports[idx], ...patch};
    this._persist();
    return this.reports[idx];
  }

  delete(id){
    const prevLen = this.reports.length;
    this.reports = this.reports.filter(r => r.id !== id);
    this._persist();
    return this.reports.length < prevLen;
  }

  find(id){ return this.reports.find(r => r.id === id) || null; }

  _persist(){ localStorage.setItem(this.storageKey, JSON.stringify(this.reports)); }
  clear(){ this.reports = []; this._persist(); }
}

/* Simple User class (encapsulation) */
class User {
  constructor(username, password){
    this._username = username;
    this._password = password;
    this._createdAt = new Date().toISOString();
  }
  get username(){ return this._username; }
  validatePassword(p){ return this._password === p; }
  toJSON(){ return {user: this._username, pass: this._password, createdAt: this._createdAt}; }
}