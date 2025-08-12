import mus from '../assets/music/RW-for-3js.mp3';

export const initMusic = () => {
    const audioContext = new AudioContext();
    let audioAnalyser: AnalyserNode;

    const audio = document.getElementById('audio') as HTMLAudioElement;
    const playPauseBtn = document.getElementById('playPauseBtn') as HTMLButtonElement;
    const restartBtn = document.getElementById('restartBtn') as HTMLButtonElement;
    const volumeSlider = document.getElementById('volumeSlider') as HTMLInputElement;

    const musicForPlay = new Audio(mus);
    const musicForAnalysis = new Audio(mus);
    const mediaElementSource = audioContext.createMediaElementSource(musicForAnalysis);

    audio.volume = Number(volumeSlider.value);

    audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.channelCount = 12;
    audioAnalyser.fftSize = 256;

    musicForAnalysis.addEventListener('canplay', () => {
        mediaElementSource.connect(audioAnalyser);
    });

    musicForPlay.addEventListener('canplay', () => {
        audio.src = musicForPlay.src;
    });

    playPauseBtn.addEventListener('click', () => {
        audioContext.resume();
        if (audio.paused) {
            audio.play();
            musicForAnalysis.play();
            playPauseBtn.textContent = '⏸️';
            playPauseBtn.classList.remove('play');
        } else {
            audio.pause();
            musicForAnalysis.pause();
            playPauseBtn.textContent = '▶️';
            playPauseBtn.classList.add('play');
        }
    });

    restartBtn.addEventListener('click', () => {
        audio.currentTime = 0;
        musicForAnalysis.currentTime = 0;
        if (audio.paused) {
            audio.play();
            musicForAnalysis.play();
            playPauseBtn.textContent = '⏸️';
            playPauseBtn.classList.remove('play');
        }
    });

    volumeSlider.addEventListener('input', () => {
        audio.volume = Number(volumeSlider.value);
    });

    audio.addEventListener('ended', () => {
        playPauseBtn.textContent = '▶️';
        playPauseBtn.classList.add('play');
    });

    return { audioAnalyser, audioContext, audio };
};
