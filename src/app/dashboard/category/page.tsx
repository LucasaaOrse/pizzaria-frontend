import styles from "./styles.module.scss";
import { Button } from "../components/button";
import { getCookiesServer } from "@/lib/cookieServer";
import { redirect } from "next/navigation";
import { api } from "@/services/api";

export default function Category() {
  async function handleRegisterCategory(formData: FormData) {
    "use server";

    const name = formData.get("name");

    if (!name || name === "") return;

    const data = {
      name: name.toString(),
    };

    const token = await getCookiesServer();

    try {
      await api.post("/category", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log("Erro ao cadastrar categoria:", error);
      return;
    }

    redirect("/dashboard");
  }

  return (
    <main className={styles.container}>
      <h1>Nova Categoria</h1>
      <form action={handleRegisterCategory} className={styles.form}>
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Ex: Pizza"
          required
          className={styles.input}
        />
        <Button name="Cadastrar" />
      </form>
    </main>
  );
}
