class Report {
    constructor(data) {
        this.id = data.id || 'r' + Date.now();
        this.title = data.title;
        this.description = data.description;
        this.type = data.type;
        this.lat = data.lat;
        this.lng = data.lng;
        this.author = data.author;
        this.status = data.status || 'Pending'; 
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

const Storage = {
    loadReports: () => JSON.parse(localStorage.getItem('campussafe_reports') || '[]'),
    saveReports: (list) => localStorage.setItem('campussafe_reports', JSON.stringify(list)),
    loadAlerts: () => JSON.parse(localStorage.getItem('campussafe_alerts') || '[]'),
    
    // **FIXED LOGIC**: This function must return the object directly or null
    loadUser: () => {
        const username = localStorage.getItem('campus_user');
        return username ? { username: username } : null; 
    },
};

class Weather {
    constructor(data) {
        // Define properties for your weather object
        this.city = data.city;
        this.temp = data.temp;
        this.description = data.description;
        this.humidity = data.humidity;
        this.wind = data.wind;
    }
}