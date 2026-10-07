import { useRef, useState, type ChangeEvent } from 'react';
import { useTraining } from '@/study/trainingContext';
import {
  createTrainingBackup,
  readTrainingBackup,
} from '@/study/trainingBackup';
import styles from '../index.module.less';

export default function Settings() {
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
    <details className={styles.settings}>
      <summary>目标与数据</summary>
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
          日语路线
          <select
            value={data.targets.ja}
            onChange={(event) => setTarget('ja', event.target.value)}
          >
            <option>入门 → N5 → N3/N2</option>
            <option>日本生活交流</option>
            <option>日语读解与 IT 工作</option>
          </select>
        </label>
        <label>
          每日预算
          <select
            value={data.dailyMinutes}
            onChange={(event) => setBudget(Number(event.target.value))}
          >
            <option value={15}>15 分钟</option>
            <option value={30}>30 分钟</option>
            <option value={45}>45 分钟</option>
          </select>
        </label>
      </div>
      <p>英日路线分别保存。当前提供入门和专项材料，后续阶段随内容增加开放。</p>
      <div className={styles.settingsActions}>
        <button
          type="button"
          className={styles.secondary}
          disabled={busy}
          onClick={() => void exportData()}
        >
          {busy ? '处理中…' : '导出备份（含录音）'}
        </button>
        <button
          type="button"
          disabled={busy}
          className={styles.secondary}
          onClick={() => input.current?.click()}
        >
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
      <p role="status">
        {notice || '记录保存在当前浏览器；换设备时可手动恢复备份。'}
      </p>
    </details>
  );
}
