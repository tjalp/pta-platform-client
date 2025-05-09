export const rolePermissions = {
    admin:  ['view_dashboard', 'pta:edit', 'pta:edit:all'],
    teacher: ['pta:edit'],
    team_leader: ['pta:edit', 'pta:edit:all'],
    student: ['pta:view'],
}

export const roleNames = {
    admin:  'Admin',
    teacher: 'Docent',
    team_leader: 'Teamleider',
    student: 'Student',
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