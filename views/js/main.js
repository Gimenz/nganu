/*
 * This file is part of the KryPtoN Bot WA distribution (https://github.com/Kry9toN/KryPtoN-WhatsApp-Bot).
 * Copyright (c) 2021 Dhimas Bagus Prayoga.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* eslint-disable no-new */
// SOCKET IO
const socket = io()
// SELECT ELEMENTS
const labelRam = document.querySelector('.ram-label')
const labelCpu = document.querySelector('.cpu-label')
const user = document.querySelector('.user')
const os = document.querySelector('.os')
const onTime = document.querySelector('.uptime')
const runTime = document.querySelector('.runtime')
const storage = document.querySelector('.storage')
const log = document.querySelector('.log')
const qrCode = document.querySelector('.qr')

// ON CONNECT EVENT
socket.on('connect', () => {
    console.log('Connected')
})
// ON RAM USAGE EVENT
socket.on('ram-usage', ({ ram, cpu, username, osInfo, runtime, uptime, storage }) => {
    // SHOW OS USER INFO
    user.innerHTML = `<span>Hello ${username}</span>`
    os.innerHTML = `<span>OS type: ${osInfo === 'Windows_NT' ? 'Microsoft Windows' : osInfo}</span>`
    // Set ram label
    labelRam.innerHTML = `<span>RAM ${ram} % </span>`
    // Set Ram bar
    $('.innerBar-ram').animate({ width: `${ram}%` }, 500)
    // Set cpu label
    labelCpu.innerHTML = `<span>CPU ${cpu} % </span>`
    // Set cpu bar
    $('.innerBar-cpu').animate({ width: `${cpu}%` }, 500)
    // Set storage label
    storage.innerHTML = `<span>CPU ${storage} % </span>`
    // Set storage bar
    $('.innerBar-storage').animate({ width: `${storage}%` }, 500)
    // Check
    if (cpu > 90) {
        notify(cpu)
    }

    function botUpTime(seconds) {
        function pad(s) {
            return (s < 10 ? '0' : '') + s
        }
        const hours = Math.floor(seconds / (60 * 60))
        const minutes = Math.floor(seconds % (60 * 60) / 60)
        seconds = Math.floor(seconds % 60)

        // return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds)
        return `<span>${pad(hours)}Jam ${pad(minutes)}Menit ${pad(seconds)}Detik</span>`
    }

    runTime.innerHTML = `Bot Runtime: ${botUpTime(runtime)}`
    onTime.innerHTML = `System Uptime: ${botUpTime(uptime)}`

})

socket.on('log', ({ loging }) => {
    log.innerHTML = `<span>${loging}</span>`
})

socket.on('qr-regen', ({ qr }) => {
    qrCode.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?data=${qr}&amp;size=250x250" />`
})

// NOTIFICATION FUNCTION
const notify = (info) => {
    // If granted
    if (Notification.permission === 'granted') {
        new Notification('Title', {
            body: `CPU over ${info} %`
        })
    }
    // If denied
    if (Notification.permission !== 'denied') {
        Notification.requestPermission()
            .then((permission) => {
                if (permission === 'granted') {
                    new Notification('Title', {
                        body: `CPU over ${info} %`
                    })
                };
            })
    };
}
