import { Utilizador } from 'wasp/entities'
import { getUtilizadores, useQuery } from 'wasp/client/operations'

export const MainPage = () => {
  const { data: tasks, isLoading, error } = useQuery(getUtilizadores)

  return (
    <div>
      {tasks && <TasksList tasks={tasks} />}

      {isLoading && 'Loading...'}
      {error && 'Error: ' + error}
    </div>
  )
}

const TaskView = ({ task }: { task: Utilizador }) => {
  return (
    <div>
      <input type="checkbox" id={String(task.UtilizadorId)}/>
      {task.Nome}
    </div>
  )
}

const TasksList = ({ tasks }: { tasks: Utilizador[] }) => {
  if (!tasks?.length) return <div>No Users</div>

  return (
    <div>
      {tasks.map((task, idx) => (
        <TaskView task={task} key={idx} />
      ))}
    </div>
  )
}