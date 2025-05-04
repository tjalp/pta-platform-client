export const rolePermissions = {
    admin:  ['view_dashboard', 'pta:edit', 'pta:edit:all'],
    teacher: ['pta:edit']
}

export function getUserPermissions(user) {
    if (!user) return []
    const permissions = new Set()
    const roles = user.roleIds || []

    roles.forEach(role => {
        (rolePermissions[role] || []).forEach(p => permissions.add(p))
    })

    return Array.from(permissions)
}