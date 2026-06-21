import { createFileRoute, getRouteApi, Link, useRouter } from '@tanstack/react-router'

import { LoginPrompt } from '#/components/LoginPrompt'
import { deleteNote, listNotes, type NoteDto } from '#/server/notes'

const appRoute = getRouteApi('/_app')

export const Route = createFileRoute('/_app/notes/')({
  loader: async () => {
    try {
      return { notes: await listNotes() }
    } catch {
      return { notes: [] as NoteDto[] }
    }
  },
  component: NotesListPage,
})

function NotesListPage() {
  const auth = appRoute.useLoaderData()
  const { notes } = Route.useLoaderData()
  const router = useRouter()

  if (!auth.user) {
    return <LoginPrompt title="登录后查看笔记" />
  }

  async function handleDelete(id: number) {
    if (!window.confirm('确定删除这条笔记吗？')) return
    await deleteNote({ data: { id } })
    await router.invalidate()
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">笔记</h1>
          <p className="mt-2 text-sm text-slate-400">你的个人笔记，仅自己可见。</p>
        </div>
        <Link
          to="/notes/new"
          className="inline-flex rounded-2xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950"
        >
          新建笔记
        </Link>
      </header>

      {notes.length === 0 ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
          <p className="text-slate-400">还没有笔记。</p>
          <Link
            to="/notes/new"
            className="mt-4 inline-flex text-sm text-sky-400 hover:text-sky-300"
          >
            写第一条笔记
          </Link>
        </section>
      ) : (
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id}>
              <div className="flex items-start justify-between gap-3 rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <Link
                  to="/notes/$id/edit"
                  params={{ id: note.id }}
                  className="flex-1 transition hover:text-sky-300"
                >
                  <p className="font-medium">{note.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    最后编辑 {new Date(note.updatedAt).toLocaleString('zh-CN')}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="shrink-0 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
