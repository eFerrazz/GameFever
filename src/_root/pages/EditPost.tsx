import { useParams } from 'react-router-dom'
import PostForm from '@/components/forms/PostForm'
import { useGetPostById } from '@/lib/react-query/queriesAndMutations';
import Loader from '@/components/shared/Loader';

const EditPost = () => {

  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || '');

  if(isPending) return <Loader />

  return (
    <div className="flex flex-1 justify-center">
      <div className="common-container w-full max-w-5xl p-6 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 w-full">
          <img 
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="Editar"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Editar Postagem</h2>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-7 mt-4">
          <PostForm action="Update" post={post}/>
        </div>

      </div>
    </div>
  )
}

export default EditPost
