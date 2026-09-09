import { soundEngine } from './soundEngine';

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording = false;
  private destNode: MediaStreamAudioDestinationNode | null = null;

  public startRecording(): boolean {
    try {
      const ctx = soundEngine.init();
      this.destNode = ctx.createMediaStreamDestination();
      
      const analyser = soundEngine.getAnalyser();
      if (analyser) {
        analyser.connect(this.destNode);
      }

      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(this.destNode.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start audio recording:', err);
      return false;
    }
  }

  public stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        this.isRecording = false;
        resolve(audioUrl);
      };

      this.mediaRecorder.stop();
    });
  }

  public getRecordingStatus(): boolean {
    return this.isRecording;
  }
}

export const audioRecorder = new AudioRecorder();
