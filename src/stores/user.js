import {defineStore} from "pinia";
import {ref} from "vue";
import {useRouter} from "vue-router";

export const useUserStore = defineStore('user', () => {
    const router = useRouter()
    const user = ref(null)

    async function fetchUser() {
        const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/user/me`, {
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

        const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/login`, {
            method: "GET",
            headers: headers,
            credentials: 'include',
        })

        if (res.ok) {
            user.value = await res.json()
        } else {
            user.value = null
        }

        return res
    }

    async function logout() {
        const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/logout`, {
            method: 'GET',
            credentials: 'include',
        })
        if (res.ok) {
            user.value = null
        }
        router.push({name: 'home'})
    }

    return {user, fetchUser, login, logout}
})