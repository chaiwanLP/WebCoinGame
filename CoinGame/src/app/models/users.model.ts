 
export interface Users {
    message: string;
    user:    User;
}

export interface User {
    id:          string;
    username:    string;
    email:       string;
    password:    string;
    profile_img: string;
    wallet:      number;
    role:        string;
}
 