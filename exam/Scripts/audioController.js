var audioController = (function() {
    var audioPool = [];
    var maxPoolSize = 3;
    var soundFiles = {};
    var audioSelectPopulated = false;

    function init() {
        fetch('audio_files.json')
            .then(response => response.json())
            .then(data => {
                soundFiles = data;
                Object.keys(soundFiles).forEach(function(type) {
                    for (var i = 0; i < 2; i++) {
                        createAudio(type);
                    }
                });
                // 总是填充音频选择框
                populateAudioSelect();
                audioSelectPopulated = true;
                removeInvalidAudioOptions();
            })
            .catch(e => errorSystem.show('音频文件加载失败: ' + e.message, 'error'));
    }

    function createAudio(type) {
        var audio = document.createElement('audio');
        audio.style.display = 'none';
        audio.preload = 'auto';
        audio.src = soundFiles[type];
        var retryCount = 0;
        function loadAudio() {
            try {
                audio.load();
            } catch(e) {
                if (retryCount++ < 3) {
                    setTimeout(loadAudio, 1000);
                }
            }
        }
        audio.addEventListener('error', function() {
            if (retryCount++ < 3) {
                setTimeout(loadAudio, 1000);
            }
        });
        document.body.appendChild(audio);
        loadAudio();
        audioPool.push(audio);
        return audio;
    }

    function play(type) {
        try {
            var audio = audioPool.find(function(a) { return a.paused; });
            if (!audio) {
                if (audioPool.length < maxPoolSize) {
                    audio = createAudio(type);
                } else {
                    return errorSystem.show('系统繁忙，请稍后再试', 'error');
                }
            }
            audio.src = soundFiles[type];
            try {
                audio.play();
            } catch(e) {
                errorSystem.show('播放失败: ' + e.message, 'error');
            }
        } catch(e) {
            errorSystem.show('音频系统错误: ' + e.message, 'error');
        }
    }

    function stop() {
        audioPool.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {}
        });
        // 停止reminderQueue中audioCache的所有音频
        if (window.audioCache) {
            Object.values(window.audioCache).forEach(audio => {
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {}
            });
        }
    }

    function getAudioSrc(type) {
        return soundFiles[type];
    }

    function populateAudioSelect() {
        if (!Object.keys(soundFiles).length) {
            // 如果音频文件还没加载完成，等待加载
            fetch('audio_files.json')
                .then(response => response.json())
                .then(data => {
                    soundFiles = data;
                    _populateSelectOptions();
                })
                .catch(e => errorSystem.show('音频选项加载失败: ' + e.message, 'error'));
        } else {
            _populateSelectOptions();
        }
    }

    function _populateSelectOptions() {
        var selects = document.querySelectorAll('select[name="audioSelect"]');
        selects.forEach(select => {
            // 保存当前选中的值
            var currentValue = select.value;
            // 清空现有选项
            select.innerHTML = '';
            // 添加新选项
            Object.keys(soundFiles).forEach(function(type) {
                var option = document.createElement('option');
                option.value = type;
                // 检查音频文件是否可用
                var audio = new Audio(soundFiles[type]);
                var unavailable = false;
                audio.addEventListener('error', function() {
                    unavailable = true;
                    option.textContent = type + '（不可用）';
                });
                // 立即尝试加载
                audio.load();
                // 默认文本
                option.textContent = type;
                // 由于audio加载是异步的，下面同步检测下src是否存在
                if (!soundFiles[type]) {
                    option.textContent = type + '（不可用）';
                }
                select.appendChild(option);
            });
            // 恢复之前选中的值（如果该值仍然有效）
            if (currentValue && soundFiles[currentValue]) {
                select.value = currentValue;
            }
        });
    }

    function removeInvalidAudioOptions() {
        var selects = document.querySelectorAll('select[name="audioSelect"]');
        selects.forEach(select => {
            Array.from(select.options).forEach(option => {
                if (!soundFiles[option.value]) {
                    option.remove();
                }
            });
        });
    }

    return {
        init: init,
        play: play,
        stop: stop,
        getAudioSrc: getAudioSrc,
        populateAudioSelect: populateAudioSelect,
        removeInvalidAudioOptions: removeInvalidAudioOptions,
        _populateSelectOptions: _populateSelectOptions
    };
})();

audioController.init();
window.audioController = audioController;
// 兼容reminderQueue的audioCache全局停止
if (typeof window.audioCache === 'undefined') window.audioCache = {};
