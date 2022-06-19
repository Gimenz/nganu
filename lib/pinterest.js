const { default: axios } = require('axios');
const { JSDOM } = require('jsdom')

const pinterestHeaders = {
    "sec-ch-ua": "\"Chromium\";v=\"90\", \"Opera GX\";v=\"76\", \";Not A Brand\";v=\"99\"",
    "sec-ch-ua-mobile": "?0",
    "upgrade-insecure-requests": "1",
    "cookie": '_b="AV/K4MPPSOhA85mqWtEGnzzVEavd7ss6OigPSN2qq1c2gIDCN9GIOv88dRkR9X7k1Js="; _auth=1; _pinterest_sess=TWc9PSZndXd6Ylo0emM4VXNwWW9Ua0xNTmIrV3YwenVreXNmS3Bpd04wMUx4VFlDc2xyaXY5a2NqWE9CMWZIUVZBYytmaWpNVElQWkhDQTAycHNVYmFyZ0hrMjJjRVNZZkJGN0tVOXMxazBBMUtpM0ZyOGRFWlQrMm56Y3l3UEkvTjFTWG5uc2ZuSTY5V01GTS9oWmlSaVQvZUwxemhTMG1HK0tlQy82Ni9VM2xzYnpEVzJHWTBYWnM1YXNlQ2NGS29vZ3N4M011eFF1ZmdBR3VDSFlZZWJIVUo5YTd0S205YkVyWlBHNVQvdGRYaHIzOWRzb0czN1JEM2x3aEtLNEVPNHpKMnp0bVVnNVF2WDFRbTJlWDdVMk9HUng0MVpwYitnQjFPU2RBRlY0QURlaVBndTB1TjYyS3phR2RpNWVYZEhkR1paTDBOVUtGOXZJdk15SEJFNTV2a1VVdGd1enRGMUZkRXB1VUVXeEs0S3lTakF4eFFZVFhlSGhGSm5YRThGcTZrRUJEY2wzQkVNNDZnODZnOE1EQ2hUTm5oOHBXaTgvYjA3enlyYlZwVEpaa1B2YjNtSUQ1WVRaK0gwRm9STUlTaS9SSEdhWXh4MWhuaENidk5CY0d2SXZabUpaWTQ4YWlRTWRoclVaVmphdHBrQ3F4YTZ2V0FJclA1UFcwQ0tndFR3ckZYZm1ySkFQbmNWZk15UVpnSW5TS0lzZEhJQWh4eEtpaEZXU3c4UVV0bEtWRUozTFZOV08xNWdicC9VVUpQdHk4b05wd1k5ZWhCSGpwVUxoTUJtYkNpenNvbEFuZUwzVmE0clRybGRRVmloeTNvb2k3R3RXQXlLQUxKNVFtQUZ5ajRDcjlEOEYxbUNGdWxtb3NQWGNBV21vSElzbXZML0tHL3YvemJEeWRQWVdFOUhMQUYzVkhLUTh4d2oyMU1mQkZBSXFHYU80SGRFL1dqVFgzdzBUczdsVHhIbHYxamx2Tm8xT1ZteUloRGtvQUI0NWVjQ2ZVN3RMaXVOaWtJSUprTlJVVUxEMXpZNGlYNktSOU4wdGZJVVg1bGg4NWVSdWZXY3ZYNE5FPSZhZHM5MGUxR1hkd3d2bU5YNG9iV1E5WVNmRFE9; csrftoken=ec0ac84a7ae235f5b8ab7d63bbe380f3; _routing_id="fb765351-a028-4475-80ec-79cb4bc417e2"; sessionFunnelEventLogged=1'
}

exports.pinterest = {
    search: async (query) => {
        try {
            const { data } = await axios.get(`https://id.pinterest.com/search/pins/?q=` + encodeURIComponent(query) + '&rs=typo_auto_original&auto_correction_disabled=true', { headers: pinterestHeaders });
            const dom = new JSDOM(data).window.document
            let json = JSON.parse(dom.getElementById('__PWS_DATA__').innerHTML)
            let array = Object.keys(json.props.initialReduxState.pins)

            let asu = []
            for (let i = 0; i < array.length; i++) {
                let data = json.props.initialReduxState.pins[array[i]]
                asu.push({
                    title: data.title,
                    media: data.images.orig,
                    created_at: data.created_at,
                    id: data.id,
                })
            }
            return asu
        } catch (error) {
            return error
        }
    },
    download: async (url) => {
        try {
            const uri = await axios.get(url).then(res => {
                let nganu = new URL(res.request.res.responseUrl)
                pathname = nganu.pathname
                return nganu.origin + pathname.slice(0, pathname.lastIndexOf('/'));
            })
            const { data } = await axios.get(uri, { headers: pinterestHeaders })
            const dom = new JSDOM(data).window.document
            let re = JSON.parse(dom.getElementById('__PWS_DATA__').innerHTML)
            const json = re.props.initialReduxState.pins[Object.keys(re.props.initialReduxState.pins)]
            let result = {
                title: json.title,
                media: json.videos !== null ? json.videos.video_list[Object.getOwnPropertyNames(json.videos.video_list)[0]] : json.images.orig,
                extension: json.videos !== null ? 'mp4' : 'jpg',
                created_at: json.created_at,
                id: json.id,
                ...json
            }
            return result
        } catch (error) {
            return error
        }
    }
}