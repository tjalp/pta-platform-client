import {defineStore} from "pinia";
import {ref} from "vue";

export const useUserStore = defineStore('user', () => {
    const user = ref(null)

    async function fetchUser() {
        const res = await fetch('http://localhost:8080/api/user/me', {
            credentials: 'include',
        })
        if (res.ok) {
            user.value = await res.json()
        } else {
            user.value = null
        }
    }

    async function login(username, password) {
        const headers = new Headers();
        headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));

        const res = await fetch("http://localhost:8080/api/login", {
            method: "GET",
            headers: headers,
            credentials: 'include',
        })

        if (res.ok) {
            user.value = await res.json()
        } else {
            user.value = null
        }
    }

    async function logout() {
        const res = await fetch('http://localhost:8080/api/logout', {
            method: 'GET',
            credentials: 'include',
        })
        if (res.ok) {
            user.value = null
        }
    }

    return {user, fetchUser, login, logout}
})