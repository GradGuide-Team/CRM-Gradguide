const endpoints = {
    login: "/auth/login",
    signup: "/auth/signup",

    // Students
    addStudent: "/v1/students",
    getAllStudents: "/v1/students",
    getStudentById: (id: string) => `/v1/students/${id}`,
    updateStudent: (id: string) => `/v1/students/${id}`,
};

export default endpoints;