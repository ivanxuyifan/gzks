document.addEventListener("DOMContentLoaded", () => {
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const reminderSettingsBtn = document.getElementById("reminder-settings-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const returnBtn = document.getElementById("return-btn");
    const topBtnGroup = document.querySelector(".top-btn-group");

    // 全屏按钮点击事件
    fullscreenBtn.addEventListener("click", () => {
        try {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        } catch (e) {
            errorSystem.show('全屏切换失败: ' + e.message);
        }
    });

    // 监听全屏状态变化
    document.addEventListener("fullscreenchange", toggleFullscreenUI);
    document.addEventListener("webkitfullscreenchange", toggleFullscreenUI);
    document.addEventListener("mozfullscreenchange", toggleFullscreenUI);
    document.addEventListener("MSFullscreenChange", toggleFullscreenUI);

    // 根据全屏状态显示或隐藏UI元素
    function toggleFullscreenUI() {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement) {
            // 进入全屏模式，隐藏按钮
            fullscreenBtn.style.display = "none";
            reminderSettingsBtn.style.display = "none";
            settingsBtn.style.display = "none";
            returnBtn.style.display = "none";
            topBtnGroup.style.display = "none";
        } else {
            // 退出全屏模式，显示按钮
            fullscreenBtn.style.display = "";
            reminderSettingsBtn.style.display = "";
            settingsBtn.style.display = "";
            returnBtn.style.display = "";
            topBtnGroup.style.display = "";
        }
    }
});
