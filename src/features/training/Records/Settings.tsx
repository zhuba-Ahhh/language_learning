import { useRef, useState, type ChangeEvent } from 'react';
import { useTraining } from '@/study/trainingContext';
import {
  createTrainingBackup,
  readTrainingBackup,
} from '@/study/trainingBackup';
import styles from '../index.module.less';
import PageHeading from '../components/PageHeading';
import TrainingIcon from '@/components/TrainingIcon';

export default function Settings({ onBack }: { onBack: () => void }) {
  const { data, setTarget, setBudget, restore } = useTraining();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const exportData = async () => {
    setBusy(true);
    setNotice('');
    try {
      const backup = await createTrainingBackup(data);
      const blob = new Blob([JSON.stringify(backup)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linguadesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(
        backup.missingRecordings.length
          ? `已导出，${backup.missingRecordings.length} 段录音在当前浏览器缺失。`
          : '已导出学习记录与录音。',
      );
    } catch {
      setNotice('备份读取失败，请检查浏览器存储权限。');
    } finally {
      setBusy(false);
    }
  };
  const importData = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    setNotice('');
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!window.confirm('恢复备份会替换这版训练记录。是否继续？')) return;
      const restored = await readTrainingBackup(value);
      if (!restore(restored)) throw new Error('训练数据不正确');
      setNotice('学习记录与录音已恢复。');
    } catch {
      setNotice('恢复失败，请使用有效的 LinguaDesk 备份；当前学习记录未替换。');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={styles.settingsPage}>
      <button type="button" className={styles.back} onClick={onBack}>
        ‹ 记录
      </button>
      <PageHeading title="设置" />
      <section className={styles.settings}>
        <div className={styles.sectionHeading}>
          <h2>学习目标</h2>
          <span>英日分别保存</span>
        </div>
        <div className={styles.settingsFields}>
          <label>
            英语目标
            <select
              value={data.targets.en}
              onChange={(event) => setTarget('en', event.target.value)}
            >
              <option>IELTS 6.5</option>
              <option>IELTS 7.0</option>
              <option>基础交流</option>
              <option>技术阅读与面试</option>
            </select>
          </label>
          <label>
            日语目标
            <select
              value={data.targets.ja}
              onChange={(event) => setTarget('ja', event.target.value)}
            >
              <option>入门 → N5 → N3/N2</option>
              <option>日本生活交流</option>
              <option>日语读解与 IT 工作</option>
            </select>
          </label>
        </div>
        <p>当前材料以入门与专项练习为主，进阶内容持续补充。</p>
      </section>
      <section className={styles.settings}>
        <div className={styles.sectionHeading}>
          <h2>每日练习</h2>
        </div>
        <div className={styles.budgetOptions}>
          {[15, 30, 45].map((minutes) => (
            <button
              key={minutes}
              type="button"
              aria-pressed={data.dailyMinutes === minutes}
              onClick={() => setBudget(minutes)}
            >
              {minutes}
              <small>分钟</small>
            </button>
          ))}
        </div>
      </section>
      <section className={styles.settings}>
        <div className={styles.sectionHeading}>
          <h2>本地数据</h2>
          <span>备份含录音</span>
        </div>
        <div className={styles.settingsActions}>
          <button
            type="button"
            className={styles.secondary}
            disabled={busy}
            onClick={() => void exportData()}
          >
            <TrainingIcon name="download" size={18} />
            {busy ? '处理中…' : '导出备份'}
          </button>
          <button
            type="button"
            disabled={busy}
            className={styles.secondary}
            onClick={() => input.current?.click()}
          >
            <TrainingIcon name="upload" size={18} />
            恢复备份
          </button>
          <input
            ref={input}
            type="file"
            hidden
            accept="application/json,.json"
            onChange={(event) => void importData(event)}
          />
        </div>
        <p role="status">{notice || '保存在此设备，换设备请恢复备份。'}</p>
      </section>
      <p className={styles.savedStatus}>
        <TrainingIcon name="check" size={16} />
        设置自动保存
      </p>
    </div>
  );
}
