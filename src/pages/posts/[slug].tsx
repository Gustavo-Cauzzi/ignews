import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../api/prismic";

import styles from './posts.module.scss';

type Post = {
  slug: string | string[];
  title: string;
  content: string;
  updatedAt: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div 
            dangerouslySetInnerHTML={{__html: post.content}} 
            className={styles.postContent}
          />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
  const session: any = await getSession({ req });
  const { slug } = params;
  const prismic = getPrismicClient(req);

  if(!session?.activeSubscription){
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const response = await prismic.getByUID('post', String(slug), {});

  let post: Post;
  if(response){
    post ={
      slug,
      title: RichText.asText(response.data.title),
      content: RichText.asHtml(response.data.content),
      updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    };
  }else{
    post = {
      slug,
      title: 'deu ruim ([slug].tsx:63)',
      content: 'deu ruim ([slug].tsx:63)',
      updatedAt: new Date(Date.now()).toString(),
    }
  }
  
  return {
    props: {
      post
    }
  }
}