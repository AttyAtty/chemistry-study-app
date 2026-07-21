# 将来のデータベース設計案

現在は教材を `src/data/chemistry.ts` に置き、学習記録をブラウザへ保存しています。生徒ログインと講師用管理画面を追加するときは、次のようなデータ構造へ移行します。

## 主なテーブル

### profiles

- id
- role: teacher / student
- display_name
- created_at

### classes

- id
- name
- teacher_id
- school_year

### class_members

- class_id
- student_id

### units

- id
- slug
- title
- summary
- sort_order
- is_published

### questions

- id
- unit_id
- question_type
- prompt
- explanation
- tags
- difficulty
- is_published

### choices

- id
- question_id
- body
- is_correct
- sort_order

### assignments

- id
- class_id
- unit_id
- title
- due_at
- question_count

### attempts

- id
- student_id
- unit_id
- assignment_id
- correct_count
- total_count
- started_at
- completed_at

### attempt_answers

- id
- attempt_id
- question_id
- selected_choice_id
- is_correct
- answered_at

## 権限の考え方

- 生徒は自分の解答履歴だけを閲覧できる
- 講師は担当クラスの成績を閲覧できる
- 教材編集は講師だけが行える
- 公開済み教材だけを生徒へ表示する

## 移行のタイミング

次の条件がそろってからデータベース化します。

- 主要単元の教材データがある程度完成した
- 何を成績として残したいか決まった
- 同時に使う生徒数が分かった
- 生徒名などの個人情報を扱う運用ルールを決めた
