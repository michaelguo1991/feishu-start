# 笔记原地编辑且无版本历史（与 Profile 的版本化模型有意不同）

新增的「笔记（Note）」功能采用单行一条、原地 `UPDATE` / `DELETE` 的模型，**不**做版本历史。这与同仓库中「资料 / Profile」的 append-only 版本化模型（每次保存 `INSERT` 新行、`version++`、旧记录永不改删）刻意不同。

现有 `profile` 功能已经把 append-only / 版本化练透了。笔记这条线的学习目标恰恰是补齐 `profile` 没碰过的 `UPDATE` 原地改与 `DELETE`——如果笔记也走版本化，等于重练已知 ground、且练不到这两个操作。因此选了原地编辑 + 无版本历史的最小切片（tracer bullet）。

## 考虑过的备选

- **像 Profile 一样版本化**（每次编辑 `INSERT` 新行）：否决。重复练习已知模式、练不到 `UPDATE`/`DELETE`，且 schema 更重（需加 `version` 列 + `(feishuOpenId, id, version)` 复合唯一索引）。
- **原地编辑 + 额外历史表（混合）**：否决（至少 v1 否决）。复杂度最高，留作后续进阶迭代。

## 后果

将来若要给笔记加版本历史，需要一次 schema 迁移：加 `version` 列、加复合唯一索引，并把既有行回填为 v1。`CONTEXT.md` 的「笔记」词条已写明"无版本历史"，若此决策变更需同步更新两者。
