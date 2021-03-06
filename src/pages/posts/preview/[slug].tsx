import { GetStaticProps } from "next"
import Head from "next/head";
import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../api/prismic";
import Link from 'next/link';

import styles from '../posts.module.scss';
import { useSession } from "next-auth/client";
import { useEffect } from "react";
import { useRouter } from "next/router";

type Post = {
  slug: string | string[];
  title: string;
  content: string;
  updatedAt: string;
}

interface PostPreviewProps {
  post: Post;
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session]: any = useSession()
  const router = useRouter();

  useEffect(() => {
    if(session?.activeSubscription){
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

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
            className={`${styles.postContent} ${styles.previewContent}`}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
              <Link href="/">
                <a>Subscribe now 🤗</a>
              </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('post', String(slug), {});

  let post: Post;
  if(response){
    post ={
      slug,
      title: RichText.asText(response.data.title),
      content: RichText.asHtml(response.data.content.splice(0, 3)),
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
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}