import PostForm from "@/components/forms/PostForm"

const CreatePost = () => {
  return (
    <div className="flex flex-1 justify-center">
      <div className="common-container w-full max-w-5xl p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 w-full">
          <img 
            src="/assets/icons/add-post.svg"
            width={36}
            height={36}
            alt="Adicionar"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Criar Postagem</h2>
        </div>

        {/* Form */}
        <div className="w-full flex flex-col gap-7 mt-4">
          <PostForm action="Create"/>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
